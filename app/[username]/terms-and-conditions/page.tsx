import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y Condiciones – Negex',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Términos y Condiciones de Uso – NEGEX
      </h1>
      <p className="text-center text-sm text-muted-foreground mb-10">
        Versión 2.0 – 22 de junio de 2026
      </p>

      <div className="prose dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. ACEPTACIÓN</h2>
          <p>
            El acceso o uso de cualquier plantilla, proyecto o recurso de NEGEX
            implica la aceptación plena e irrevocable de los presentes términos.
            Si no está de acuerdo, absténgase de utilizar la Plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. DEFINICIONES</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>NEGEX:</strong> sociedad proveedora de plantillas y recursos gráficos.</li>
            <li><strong>Plantilla:</strong> todo diseño, maqueta, documento o recurso puesto a disposición en la Plataforma.</li>
            <li><strong>Usuario:</strong> toda persona física o jurídica que acceda o utilice las Plantillas.</li>
            <li><strong>Contenido del Usuario:</strong> materiales (textos, imágenes, logos) que el Usuario incorpore a las Plantillas.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. LICENCIA DE USO</h2>
          <p>
            NEGEX concede una licencia limitada, no exclusiva, intransferible y
            revocable para utilizar las Plantillas en proyectos personales,
            educativos o comerciales, siempre que se respeten las prohibiciones
            de la cláusula 5. La licencia es por usuario o cuenta corporativa,
            según el plan contratado, y no permite la redistribución de las
            Plantillas en su forma original.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. PROPIEDAD INTELECTUAL</h2>
          <p>
            Las Plantillas y todos sus elementos son propiedad exclusiva de
            NEGEX o de sus licenciantes, protegidos por la normativa de
            propiedad intelectual. El Usuario no adquiere titularidad alguna;
            solo obtiene el derecho de uso conforme a la licencia. El Contenido
            del Usuario sigue siendo de su propiedad, pero concede a NEGEX
            una licencia limitada para su almacenamiento y visualización en la
            Plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. PROHIBICIONES</h2>
          <p>El Usuario no podrá:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Utilizar las Plantillas con fines ilícitos, discriminatorios o que vulneren derechos de terceros.</li>
            <li>Revender, sublicenciar, alquilar o distribuir las Plantillas como producto independiente.</li>
            <li>Crear productos competidores de NEGEX basados en sus Plantillas.</li>
            <li>Introducir código malicioso o intentar acceder a cuentas ajenas.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. RESPONSABILIDAD DEL USUARIO</h2>
          <p>
            El Usuario es el único responsable del Contenido que suba o
            modifique, garantizando que dispone de todos los derechos necesarios
            y que su uso no infringe normas aplicables. Asimismo, es responsable
            de la custodia de sus credenciales y de todas las actividades
            realizadas bajo su cuenta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. EXENCIÓN DE GARANTÍAS Y LIMITACIÓN DE RESPONSABILIDAD</h2>
          <p>
            NEGEX ofrece las Plantillas &quot;tal cual&quot;, sin garantías de
            comerciabilidad, idoneidad o ausencia de errores. En ningún caso
            NEGEX será responsable por daños directos, indirectos o
            consecuentes derivados del uso de la Plataforma. La responsabilidad
            total de NEGEX, en caso de reconocerse, no excederá del importe
            abonado por el Usuario en los últimos doce meses.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. INDEMNIZACIÓN</h2>
          <p>
            El Usuario indemnizará a NEGEX y a sus colaboradores por cualquier
            reclamación, pérdida o gasto (incluidos honorarios legales) que
            surja de su uso indebido de la Plataforma, de la violación de estos
            términos o de la infracción de derechos de terceros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. PRIVACIDAD Y DATOS</h2>
          <p>
            NEGEX tratará los datos personales conforme a su Política de
            Privacidad, disponible en la Plataforma. El Usuario consiente dicho
            tratamiento y podrá ejercer sus derechos de acceso, rectificación,
            cancelación y oposición conforme al RGPD, mediante solicitud a{' '}
            <a href="mailto:legal@negex.com" className="text-primary hover:underline">
              legal@negex.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">10. TERMINACIÓN</h2>
          <p>
            NEGEX podrá suspender o terminar la cuenta del Usuario ante el
            incumplimiento de estas condiciones. El Usuario podrá cancelar su
            cuenta en cualquier momento. Tras la terminación, deberá cesar el
            uso de las Plantillas y destruir las copias existentes, salvo los
            proyectos finales entregados a terceros que no constituyan una
            Plantilla en sí mismos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">11. MODIFICACIONES</h2>
          <p>
            NEGEX podrá modificar estos términos en cualquier momento,
            publicando la versión actualizada en la Plataforma. El uso
            continuado tras la publicación implicará la aceptación de los
            cambios. Los cambios sustanciales serán notificados con al menos
            15 días de antelación por correo electrónico.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">12. LEY APLICABLE Y JURISDICCIÓN</h2>
          <p>
            Estos términos se rigen por la legislación de España. Cualquier controversia
            será sometida a los tribunales de Madrid, con renuncia expresa a cualquier otro fuero.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">13. DISPOSICIONES FINALES</h2>
          <p>
            Si alguna cláusula fuera nula, las restantes subsistirán. La falta
            de ejercicio de un derecho por parte de NEGEX no constituirá
            renuncia al mismo. El Usuario no podrá ceder estos derechos sin
            consentimiento escrito de NEGEX.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">14. CONTACTO</h2>
          <p>
            Para consultas sobre estos términos, contacte en:{' '}
            <a href="mailto:legal@negex.com" className="text-primary hover:underline">
              legal@negex.com
            </a>{' '}
            |{' '}
            <a href="https://negex.vercel.app/contacto" className="text-primary hover:underline">
              www.negex.com/contacto
            </a>
          </p>
        </section>

        <hr className="my-8" />

        <section className="text-center font-semibold text-base">
          <p>ACEPTACIÓN EXPRESA</p>
          <p className="text-sm text-muted-foreground mt-2">
            Al utilizar cualquier Plantilla o la Plataforma, el Usuario
            declara haber leído, comprendido y aceptado formalmente la
            totalidad de las condiciones anteriores.
          </p>
        </section>

        <hr className="my-8" />

        <p className="text-center text-muted-foreground text-xs">
          FIN DEL DOCUMENTO
        </p>
      </div>
    </div>
  );
}
