import { useCallback, useEffect, useMemo } from 'react';
import Spotlight from '@enact/spotlight';
import cx from 'classnames';

import Scrollable from 'components/scrollable';
import SpotlightContainer from 'components/spotlightContainer';
import useButtonEffect, { KeyboardCodesKeys } from 'hooks/useButtonEffect';
import useHashTrigger from 'hooks/useHashTrigger';

type Props = {
  visible: boolean;
  onClose: () => void;
  closeButton?: KeyboardCodesKeys;
} & React.HTMLAttributes<HTMLDivElement>;

const Popup: React.FC<Props> = ({ visible, onClose, children, className, closeButton = 'Blue', ...props }) => {
  const containerId = useMemo(() => Spotlight.add({}), []);
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleCloseIfVisible = useCallback(() => {
    if (visible) {
      handleClose();

      return false;
    }
  }, [visible, handleClose]);

  const spotPopupContent = useCallback(() => {
    if (!Spotlight.focus(containerId)) {
      const current = Spotlight.getCurrent();

      // In cases where the container contains no spottable controls or we're in pointer-mode, focus
      // cannot inherently set the active container or blur the active control, so we must do that
      // here.
      if (current) {
        // @ts-expect-error
        current.blur();
      }

      Spotlight.setActiveContainer(containerId);
      setTimeout(() => {
        Spotlight.setPointerMode(false);
        Spotlight.focus(containerId);
      }, 500);
    }
  }, [containerId]);

  const scrollActiveElementIntoView = useCallback(() => {
    const current = Spotlight.getCurrent();

    requestAnimationFrame(() => {
      // @ts-expect-error
      current?.scrollIntoViewIfNeeded();
    });
  }, []);

  useButtonEffect('Back', handleCloseIfVisible);
  useButtonEffect('ArrowUp', scrollActiveElementIntoView);
  useButtonEffect('ArrowDown', scrollActiveElementIntoView);
  useButtonEffect(closeButton, handleCloseIfVisible);
  const hashTrigger = useHashTrigger('popup', handleCloseIfVisible);

  useEffect(() => {
    if (visible) {
      spotPopupContent();
      hashTrigger.open();
    } else {
      hashTrigger.close();
    }
  }, [visible, spotPopupContent, hashTrigger]);

  return (
    <>
      <div
        className={cx('fixed z-999 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50', {
          hidden: !visible,
        })}
        onClick={handleClose}
      />
      <SpotlightContainer
        {...props}
        spotlightId={containerId}
        spotlightRestrict="self-only"
        spotlightDisabled={!visible}
        className={cx(
          'fixed z-999 bottom-0 left-0 right-0 p-4 bg-black ring',
          {
            hidden: !visible,
          },
          className,
        )}
      >
        <Scrollable className="max-h-screen">{children}</Scrollable>
      </SpotlightContainer>
    </>
  );
};

export default Popup;
