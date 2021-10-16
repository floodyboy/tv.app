import { useCallback, useEffect, useMemo, useState } from 'react';
import { Switch, useHistory } from 'react-router-dom';

import Spinner from 'components/spinner';
import Text from 'components/text';
import useButtonEffect from 'hooks/useButtonEffect';
import useDeviceAuthorizationEffect, { AuthorizationStep } from 'hooks/useDeviceAuthorizationEffect';
import useStorageState from 'hooks/useStorageState';
import { PATHS } from 'routes';

const Views: React.FC = ({ children, ...props }) => {
  const history = useHistory();
  const [showNotice, setShowNotice] = useState(false);
  const [showSpinner, setShowSpinner] = useState(true);
  const [authorizationStep, setAuthorizationStep] = useState<AuthorizationStep>();
  const [helpShown, setHelpShown] = useStorageState<boolean>('is_help_shown');
  const shouldShowHelp = useMemo(() => process.env.REACT_APP_HIDE_HELP_MENU !== 'true' && !helpShown, [helpShown]);

  const handleBackButtonClick = useCallback(() => {
    if (history.location.pathname !== PATHS.Home) {
      history.goBack();
    } else if (showNotice) {
      window.close();
    } else {
      setShowNotice(true);

      setTimeout(() => {
        setShowNotice(false);
      }, 5 * 1000);
    }
  }, [history, showNotice]);

  const handleAuthorization = useCallback(
    (authorizationStep: AuthorizationStep) => {
      setAuthorizationStep(authorizationStep);

      const path = history.location.pathname;
      if (authorizationStep === 'authorized') {
        if (path === PATHS.Pair || path === PATHS.Index) {
          if (shouldShowHelp) {
            setHelpShown(true);
            history.replace(PATHS.Help);
          } else {
            history.replace(PATHS.Home);
          }
        }
      }
    },
    [history, shouldShowHelp, setHelpShown],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowSpinner(authorizationStep === 'processing');
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [authorizationStep]);

  useButtonEffect('Back', handleBackButtonClick);
  useDeviceAuthorizationEffect(handleAuthorization);

  if (showSpinner) {
    return <Spinner />;
  }

  return (
    <div {...props}>
      {showNotice && (
        <div className="fixed top-2 right-2 p-4 z-999 shadow-xl rounded-xl bg-gray-500 bg-opacity-70">
          <Text>
            Чтобы закрыть приложение,
            <br />
            нажмите кнопку "назад" ещё раз
          </Text>
        </div>
      )}
      <Switch>{children}</Switch>
    </div>
  );
};

export default Views;
