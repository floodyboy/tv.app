import React, { useCallback, useEffect, useRef, useState } from 'react';
import VideoPlayer, { VideoPlayerBase, VideoPlayerBaseProps } from '@enact/moonstone/VideoPlayer';
import Spotlight from '@enact/spotlight';

import BackButton from 'components/backButton';
import Button from 'components/button';
import Media, { AudioTrack, MediaProps, SourceTrack, StreamingType, SubtitleTrack } from 'components/media';
import Text from 'components/text';
import useButtonEffect from 'hooks/useButtonEffect';
import useStorageState from 'hooks/useStorageState';

import Settings from './settings';
import StartFrom from './startFrom';

import { isKey } from 'utils/keyboard';

export type PlayerMediaState = {
  currentTime: number;
  duration: number;
  paused: boolean;
  playbackRate: number;
  proportionLoaded: number;
  proportionPlayed: number;
};

export type PlayerProps = {
  title: string;
  description?: string;
  poster: string;
  audios?: AudioTrack[];
  sources: SourceTrack[];
  subtitles?: SubtitleTrack[];
  startTime?: number;
  timeSyncInterval?: number;
  streamingType?: StreamingType;
  onPlay?: (state: PlayerMediaState) => void;
  onPause?: (state: PlayerMediaState) => void;
  onEnded?: (state: PlayerMediaState) => void;
  onTimeSync?: (state: PlayerMediaState) => void | Promise<void>;
} & VideoPlayerBaseProps &
  Omit<MediaProps, 'onPlay' | 'onPause' | 'onEnded'>;

const Player: React.FC<PlayerProps> = ({
  title,
  description,
  poster,
  audios,
  sources,
  subtitles,
  startTime,
  timeSyncInterval = 30,
  streamingType,
  onPlay,
  onPause,
  onEnded,
  onTimeSync,
  onJumpBackward,
  onJumpForward,
  ...props
}) => {
  const playerRef = useRef<VideoPlayerBase>();
  const [isPaused, setIsPaused] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPauseByOKClickActive] = useStorageState<boolean>('is_pause_by_ok_click_active');

  const getPlayerMediaState = useCallback(() => (playerRef.current?.getMediaState() || {}) as PlayerMediaState, []);

  const handlePlay = useCallback(
    (e) => {
      setIsPaused(false);
      setIsSettingsOpen(false);
      onPlay?.(e as PlayerMediaState);
    },
    [onPlay],
  );

  const handlePause = useCallback(
    (e) => {
      setIsPaused(true);
      onPause?.(e as PlayerMediaState);
    },
    [onPause],
  );

  const handlePlayPause = useCallback(
    (e: KeyboardEvent) => {
      const current = Spotlight.getCurrent() as HTMLElement;
      if (playerRef.current && (isPauseByOKClickActive || isKey(e, 'PlayPause'))) {
        if (!current || !current.offsetHeight || !current.offsetWidth || current.getAttribute('aria-hidden') === 'true') {
          const video: any = playerRef.current.getVideoNode();
          video.playPause();
          return false;
        } else if (current && (current.getAttribute('aria-label') === 'Pause' || current.getAttribute('aria-label') === 'Play')) {
          current.click();
          return false;
        }
      }
    },
    [isPauseByOKClickActive],
  );

  const handleEnded = useCallback(() => {
    const state = getPlayerMediaState();
    onEnded?.(state);
  }, [onEnded, getPlayerMediaState]);

  const handleTimeSync = useCallback(() => {
    const state = getPlayerMediaState();
    onTimeSync?.(state);
  }, [onTimeSync, getPlayerMediaState]);

  const handleLoadedMetadata = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleSettingsOpen = useCallback(() => {
    setIsSettingsOpen(true);
    playerRef.current?.pause();
  }, []);

  const handleSettingsClose = useCallback(() => {
    setIsSettingsOpen(false);
    playerRef.current?.play();
  }, []);

  const handlePauseButton = useCallback(() => {
    playerRef.current?.pause();
  }, []);

  const handleChannelUp = useCallback(() => {
    const state = getPlayerMediaState();
    onJumpForward?.(state);
  }, [onJumpForward, getPlayerMediaState]);

  const handleChannelDown = useCallback(() => {
    const state = getPlayerMediaState();
    onJumpBackward?.(state);
  }, [onJumpBackward, getPlayerMediaState]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isPaused) {
      timeoutId = setTimeout(() => {
        setIsPaused(false);
      }, 15 * 1000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isPaused]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (onTimeSync) {
      intervalId = setInterval(handleTimeSync, timeSyncInterval * 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [timeSyncInterval, onTimeSync, handleTimeSync]);

  useButtonEffect('Back', handleTimeSync);
  useButtonEffect('Blue', handleSettingsOpen);
  useButtonEffect('Play', handleSettingsClose);
  useButtonEffect('Pause', handlePauseButton);
  useButtonEffect(['PlayPause', 'Enter'], handlePlayPause);
  useButtonEffect('ChannelUp', handleChannelUp);
  useButtonEffect('ChannelDown', handleChannelDown);
  useButtonEffect('ArrowUp', handleSettingsOpen);

  return (
    <>
      <Settings visible={isSettingsOpen} onClose={handleSettingsClose} player={playerRef} />
      {isPaused && (
        <div className="absolute z-10 top-0 px-4 pt-2 flex items-center">
          <BackButton className="mr-2" />
          <Text>{title}</Text>
        </div>
      )}
      {isPaused && <Button className="absolute z-101 bottom-8 right-10 text-blue-600" icon="settings" onClick={handleSettingsOpen} />}
      {isLoaded && startTime! > 0 && <StartFrom startTime={startTime} player={playerRef} />}

      <VideoPlayer
        {...props}
        //@ts-expect-error
        ref={playerRef}
        locale="ru"
        poster={poster}
        title={description}
        jumpBy={15}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onJumpForward={onJumpForward}
        onJumpBackward={onJumpBackward}
        onLoadedMetadata={handleLoadedMetadata}
        streamingType={streamingType}
        isSettingsOpen={isSettingsOpen}
        audioTracks={audios}
        sourceTracks={sources}
        subtitleTracks={subtitles}
        videoComponent={<Media />}
      />
    </>
  );
};

export default Player;
