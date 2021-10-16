import { useCallback, useEffect, useMemo, useState } from 'react';
import { VideoPlayerBase } from '@enact/moonstone/VideoPlayer';

import Button from 'components/button';
import SpotlightContainer from 'components/spotlightContainer';
import useButtonEffect from 'hooks/useButtonEffect';

import { secondsToDuration } from 'utils/date';

type Props = {
  player: React.MutableRefObject<VideoPlayerBase | undefined>;
  startTime?: number;
  startInDelay?: number;
};

const StartFrom: React.FC<Props> = ({ startTime, startInDelay = 5, player }) => {
  const [visible, setVisible] = useState(true);
  const [startIn, setStartIn] = useState(startInDelay);
  const startFrom = useMemo(() => secondsToDuration(startTime), [startTime]);

  const handleStartFromClick = useCallback(() => {
    if (player.current) {
      setVisible(false);
      const video: any = player.current.getVideoNode();

      video.currentTime = startTime;
    }
  }, [startTime, player]);
  const handleStartFromBeginingClick = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (visible) {
      intervalId = setInterval(() => {
        setStartIn((prevStartIn) => {
          const newStartIn = prevStartIn - 1;

          if (newStartIn <= 0) {
            handleStartFromClick();
          }

          return newStartIn;
        });
      }, 1000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [visible, handleStartFromClick]);

  useButtonEffect('Red', handleStartFromClick);
  useButtonEffect('Green', handleStartFromBeginingClick);

  if (!startTime || !visible) {
    return null;
  }

  return (
    <SpotlightContainer spotlightRestrict="self-only" className="flex justify-center absolute w-full z-101 bottom-32">
      <Button onClick={handleStartFromClick} className="text-red-600">
        Смотреть с {startFrom} через {startIn}
      </Button>
      <Button autoFocus onClick={handleStartFromBeginingClick} className="text-green-600">
        Смотреть с начала
      </Button>
    </SpotlightContainer>
  );
};

export default StartFrom;
