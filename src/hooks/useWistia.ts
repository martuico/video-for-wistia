import { useEffect, useState } from 'react';
import { fetchProjects } from '../api/wistia';
import { WistiaItem } from '../types';

export const useWistia = (apiKey: string) => {
  const [projects, setProjects] = useState<WistiaItem[]>([]);
  const [loading, setLoadingStatus] = useState(false);
  
  useEffect(() => {
    if (apiKey) {
      setLoadingStatus(true);
      (async function effectProjects() {
        const project = await fetchProjects(apiKey);

        if (project.success && project.data) {
          setProjects(project.data);
        }
        setLoadingStatus(false);
      })();
    }
  }, [apiKey]);

  return [projects, loading] as const;
};
