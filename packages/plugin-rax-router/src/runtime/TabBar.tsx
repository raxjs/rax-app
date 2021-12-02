import { createElement, useState, useEffect } from 'rax';

export default function TabBarWrapper({ renderTabBar, history }) {
  const [, setPathName] = useState(history.location.pathname);
  useEffect(() => {
    const unlisten = history.listen(() => {
      setPathName(history.location.pathname);
    });
    return unlisten;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return renderTabBar();
}
