'use client';
import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types';
import { getProjectsByUser, createProject, updateProject, deleteProject } from '@/lib/firestore';
import { useAuth } from './useAuth';

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await getProjectsByUser(user.uid);
    setProjects(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = async (data: Partial<Project>) => {
    if (!user) throw new Error('No autenticado');
    const id = await createProject(user.uid, data);
    await fetch();
    return id;
  };

  const update = async (projectId: string, data: Partial<Project>) => {
    await updateProject(projectId, data);
    await fetch();
  };

  const remove = async (projectId: string) => {
    await deleteProject(projectId);
    await fetch();
  };

  return { projects, loading, create, update, remove, refetch: fetch };
};
