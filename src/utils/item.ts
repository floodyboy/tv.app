import { ItemDetails, Video, WatchingStatus } from 'api';

export function getItemSeasonToPlay(item?: ItemDetails, seasonId?: string | number) {
  const season =
    item?.seasons?.find(({ number, watching }) => (seasonId ? +seasonId === +number : watching.status !== WatchingStatus.Watched)) ||
    item?.seasons?.[0];

  return season;
}

export function getItemVideoToPlay(item?: ItemDetails, episodeId?: string | number, seasonId?: string | number) {
  const season = getItemSeasonToPlay(item, seasonId);
  const video =
    item?.videos?.find(({ number, watching }) => (episodeId ? +episodeId === +number : watching.status !== WatchingStatus.Watched)) ||
    item?.videos?.[0];
  const episode =
    season?.episodes.find(({ number, watching }) => (episodeId ? +episodeId === +number : watching.status !== WatchingStatus.Watched)) ||
    season?.episodes[0];

  return (video || episode)!;
}

export function getItemTitle(item?: ItemDetails, video?: Video) {
  const title = item?.title || '';

  return video?.snumber ? `${title} (s${video?.snumber || 1}e${video?.number || 1})` : title;
}

export function getItemDescription(item?: ItemDetails, video?: Video) {
  const title = video?.title || '';
  const episode = `s${video?.snumber || 1}e${video?.number || 1}`;

  return video?.snumber ? (title ? `${title} (${episode})` : episode) : title;
}

export function getItemQualityIcon(item?: ItemDetails) {
  return item?.quality ? (item.quality === 2160 ? '4k' : item.quality === 1080 || item.quality === 720 ? 'hd' : 'sd') : null;
}
