import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HomePage from './HomePage';
import { useApp } from '../contexts/AppContext';

export default function ReuseWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const store = useApp();
  const initialized = useRef(false);

  useEffect(() => {
    if (location.state?.reuse && !initialized.current) {
      initialized.current = true;
      const { mappingConfig, templateHeaders, mappingId } = location.state;
      store.setTemplateFile({
        name: 'قالب ذخیره‌شده',
        headers: templateHeaders,
        rows: [],
        totalRows: 0,
      });
      store.setMappings(mappingConfig);
      store.setReuseMappingId(mappingId);
      navigate('/', { replace: true, state: undefined });
    }
  }, [location.state]);

  return <HomePage />;
}
