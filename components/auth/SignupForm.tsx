'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getUserByUsername } from '@/lib/firestore';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe tener al menos una minúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número')
    .regex(/[@$!%*?&]/, 'Debe tener al menos un carácter especial (@$!%*?&)'),
  confirmPassword: z.string(),
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos')
    .optional()
    .or(z.literal('')),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export const SignupForm = () => {
  const { signup } = useAuth();
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const password = watch('password', '');
  const strength = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&]/.test(password),
  };
  const strengthScore = Object.values(strength).filter(Boolean).length;

  const checkUsername = async (username: string) => {
    if (username.length < 3) { setUsernameAvailable(null); return; }
    try {
      const exists = await getUserByUsername(username);
      setUsernameAvailable(!exists);
    } catch {
      setUsernameAvailable(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const uname = data.username || data.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
      await signup(data.email, data.password, uname);
      toast.success('¡Cuenta creada con éxito!');
      // Redirigir a la raíz; el layout autenticado llevará al dashboard
      router.push('/');
    } catch (err: any) {
      let msg = 'Error al crear cuenta';
      if (err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use': msg = 'Este correo ya está registrado'; break;
          case 'auth/weak-password': msg = 'La contraseña es demasiado débil'; break;
          case 'auth/invalid-email': msg = 'Correo electrónico no válido'; break;
          case 'auth/operation-not-allowed': msg = 'El registro con correo/contraseña no está habilitado en Firebase'; break;
          case 'permission-denied': case 'PERMISSION_DENIED': msg = 'Error de permisos en la base de datos'; break;
          default: msg = err.message || msg;
        }
      } else if (err.message) {
        msg = err.message;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 w-full max-w-md"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="email" type="email" placeholder="tu@email.com" className="pl-10" {...register('email')} />
        </div>
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Nombre de usuario (opcional)</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="username" placeholder="usuario_ejemplo" className="pl-10 pr-10" {...register('username')}
            onBlur={(e) => checkUsername(e.target.value)} />
          {usernameAvailable === true && <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
          {usernameAvailable === false && <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
        </div>
        {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="password" type={showPass ? 'text' : 'password'} className="pl-10 pr-10" {...register('password')} />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2">
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex gap-1 mt-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${
              strengthScore >= i ? (i <= 2 ? 'bg-red-500' : i <= 4 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200 dark:bg-gray-700'
            }`} />
          ))}
        </div>
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="confirmPassword" type={showConfirm ? 'text' : 'password'} className="pl-10 pr-10" {...register('confirmPassword')} />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2">
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creando cuenta...
          </span>
        ) : (
          <span className="flex items-center">
            Crear cuenta <ArrowRight className="ml-2 h-4 w-4" />
          </span>
        )}
      </Button>
    </motion.form>
  );
};
