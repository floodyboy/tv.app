import { useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import cx from 'classnames';

import { Bool, Item, ItemMediaResponse } from 'api';
import Icon from 'components/icon';
import ImageItem from 'components/imageItem';
import useApiMutation from 'hooks/useApiMutation';
import useButtonEffect from 'hooks/useButtonEffect';
import { PATHS, generatePath } from 'routes';

import { ReactComponent as Imdb } from './assets/imdb.svg';
import { ReactComponent as Kinopoisk } from './assets/kinopoisk.svg';

import { getItemQualityIcon } from 'utils/item';
import { numberToHuman } from 'utils/number';

type Props = {
  item?: Item;
  className?: string;
  wrapperClassName?: string;
  showViews?: boolean;
  noCaption?: boolean;
  disableNavigation?: boolean;
  episodeId?: string | number;
  seasonId?: string | number;
  playOnClick?: boolean;
};

const VideoItem: React.FC<Props> = ({
  item,
  className,
  wrapperClassName,
  showViews,
  noCaption,
  disableNavigation,
  episodeId,
  seasonId,
  playOnClick,
  children,
}) => {
  const history = useHistory();
  const [isFocused, setIsFocused] = useState(false);
  const qualityIcon = getItemQualityIcon(item);
  const title = useMemo(() => item?.title?.split('/')[0], [item?.title]);
  const views = useMemo(() => (showViews && item?.views && numberToHuman(item?.views)) || '', [showViews, item?.views]);
  const { itemMediaAsync } = useApiMutation('itemMedia');

  const handleOnPlayClick = useCallback(async () => {
    if (item?.id && !disableNavigation && isFocused) {
      const data = (await itemMediaAsync([item.id])) as unknown as ItemMediaResponse;

      history.push(
        generatePath(
          PATHS.Video,
          {
            itemId: data?.item.id,
          },
          {
            ...(seasonId ? { seasonId: `${seasonId}` } : {}),
            ...(episodeId ? { episodeId: `${episodeId}` } : {}),
          },
        ),
        {
          item: data?.item,
        },
      );
    }
  }, [item?.id, disableNavigation, episodeId, seasonId, isFocused, history, itemMediaAsync]);
  const handleOnClick = useCallback(() => {
    if (playOnClick) {
      handleOnPlayClick();
    } else if (item?.id && !disableNavigation) {
      history.push(
        generatePath(PATHS.Item, {
          itemId: item.id,
        }),
      );
    }
  }, [item?.id, disableNavigation, playOnClick, handleOnPlayClick, history]);

  useButtonEffect(['Play', 'PlayPause', 'Red'], handleOnPlayClick);

  return (
    <ImageItem
      onClick={handleOnClick}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      source={item?.posters.medium}
      caption={noCaption ? '' : title}
      className={cx('h-72', className)}
      wrapperClassName={wrapperClassName}
    >
      {children}
      {item?.new && (
        <div className="absolute bg-red-600 border-gray-300 border-t-2 border-r-2 text-gray-200 px-2 py-1 rounded-bl rounded-tr-xl top-0 right-0">
          {item?.new}
        </div>
      )}
      {views && (
        <div className="absolute top-2 right-2 h-6 pr-2 text-xs text-gray-200 bg-black bg-opacity-50 rounded flex items-center">
          <Icon name="visibility" />
          {views}
        </div>
      )}
      {Boolean(seasonId && episodeId) && (
        <div className="absolute top-2 right-2 h-6 px-2 text-xs text-gray-200 bg-black bg-opacity-50 rounded flex items-center">
          {`s${seasonId}e${episodeId}`}
        </div>
      )}
      {(qualityIcon || item?.ac3 || item?.advert) && (
        <div className="absolute top-2 left-2 h-6 bg-black bg-opacity-50 rounded flex items-center">
          {qualityIcon && <Icon name={qualityIcon} />}
          {item?.ac3 === Bool.True && <Icon name="graphic_eq" />}
          {item?.advert && <Icon name="report" />}
        </div>
      )}
      {Boolean(item?.rating! > 0 || item?.imdb_rating! > 0 || item?.kinopoisk_rating! > 0) && (
        <div className="absolute bottom-2 left-2 right-2 h-6 px-2 text-xs text-gray-200 bg-black bg-opacity-50 rounded flex justify-between items-center">
          <div className="flex items-center justify-start w-1/3">
            <Imdb className="h-3 w-3 mr-1" />
            <span>{(item?.imdb_rating || 0).toFixed(1)}</span>
          </div>

          <div className="flex items-center justify-center w-1/3">
            <Kinopoisk className="h-3 w-3 mr-1" />
            <span>{(item?.kinopoisk_rating || 0).toFixed(1)}</span>
          </div>

          <div className="flex items-center justify-end w-1/3">
            <Icon name="thumb_up" />
            <span>{item?.rating_percentage || 0}%</span>
          </div>
        </div>
      )}
    </ImageItem>
  );
};

export default VideoItem;
