import React, { useCallback, useMemo, useState } from 'react';
import filter from 'lodash/filter';
import findIndex from 'lodash/findIndex';
import map from 'lodash/map';

import { Bool, DeviceSettingBoolean, DeviceSettingList, DeviceSettingsParams } from 'api';
import Button from 'components/button';
import Checkbox from 'components/checkbox';
import Select from 'components/select';
import Seo from 'components/seo';
import Text from 'components/text';
import Title from 'components/title';
import useApi from 'hooks/useApi';
import useApiMutation from 'hooks/useApiMutation';
import useDeviceInfo from 'hooks/useDeviceInfo';
import useStorageState from 'hooks/useStorageState';

const SettingBool: React.FC<{ setting: DeviceSettingBoolean; onChange?: (checked: boolean) => void }> = ({ setting, onChange }) => {
  return (
    <Checkbox className="w-full" defaultChecked={setting.value === Bool.True} onChange={onChange}>
      {setting.label}
    </Checkbox>
  );
};

const SettingList: React.FC<{ setting: DeviceSettingList; onChange?: (value: number) => void }> = ({ setting, onChange }) => {
  const options = useMemo(
    () => map(setting.value, (value) => `${value.label} ${value.description ? `(${value.description})` : ''}`),
    [setting.value],
  );

  return (
    <Select
      defaultValue={findIndex(setting.value, (value) => value.selected === Bool.True)}
      label={setting.label}
      onChange={onChange}
      options={options}
    />
  );
};

const HTTP_STREAMING_ID = 1;
const HLS_STREAMING_ID = 2;
// const HLS2_STREAMING_ID = 3;
// const HLS4_STREAMING_ID = 4;
const QUALITY_4K = '2160';

const QUALITY_OPTIONS = [
  {
    title: 'Маскимально доступное',
    value: null,
  },
  {
    title: '2160p (4K, Ultra HD)',
    value: '2160',
  },
  {
    title: '1080p (Full HD)',
    value: '1080',
  },
  {
    title: '720p (HD)',
    value: '720',
  },
  {
    title: '480p (SD)',
    value: '480',
  },
];

const SettingsView: React.FC = () => {
  const { data } = useApi('user');
  const { data: deviceInfo } = useApi('deviceInfo');
  const { saveDeviceSettingsAsync } = useApiMutation('saveDeviceSettings');
  const { deactivate } = useApiMutation('deactivate');
  const [newSettings, setNewSettings] = useState<DeviceSettingsParams>({});
  const [isHLSJSActive, setIsHLSJSActive] = useStorageState<boolean>('is_hls.js_active');
  const [defaultQuality, setDefaultQuality] = useStorageState<string | null>('default_quality', null);
  const [isAC3ByDefaultActive, setIsAC3ByDefaultActive] = useStorageState<boolean>('is_ac3_by_default_active');
  const [isForcedByDefaultActive, setIsForcedByDefaultActive] = useStorageState<boolean>('is_forced_by_default_active');
  const [isPauseByOKClickActive, setIsPauseByOKClickActive] = useStorageState<boolean>('is_pause_by_ok_click_active');
  const [isSwitchToHLSFromHTTPActive, setIsSwitchToHLSFromHTTPActive] = useStorageState<boolean>('is_switch_to_hls_from_http_active');
  const { software, hardware } = useDeviceInfo();
  const isStreamingSelected = useCallback(
    (streamingId: number) =>
      newSettings.streamingType
        ? newSettings.streamingType === streamingId
        : deviceInfo?.device.settings.streamingType.value.some(({ id, selected }) => +id === streamingId && selected === Bool.True),
    [newSettings, deviceInfo],
  );
  const isHTTPStreamingSelected = useMemo(() => isStreamingSelected(HTTP_STREAMING_ID), [isStreamingSelected]);
  const isHLSStreamingSelected = useMemo(() => isStreamingSelected(HLS_STREAMING_ID), [isStreamingSelected]);
  const is4KSelected = useMemo(
    () => newSettings.support4k ?? deviceInfo?.device.settings.support4k.value === Bool.True,
    [newSettings, deviceInfo],
  );
  const qualityOptions = useMemo(
    () => (is4KSelected ? QUALITY_OPTIONS : QUALITY_OPTIONS.filter(({ value }) => value !== QUALITY_4K)),
    [is4KSelected],
  );

  const boolSettings = useMemo(
    () =>
      filter(
        map(deviceInfo?.device?.settings, (setting, key) => ({ ...setting, key })),
        (setting: DeviceSettingBoolean) => typeof setting['type'] === 'undefined',
      ) as (DeviceSettingBoolean & { key: string })[],
    [deviceInfo?.device?.settings],
  );
  const listSettings = useMemo(
    () =>
      filter(
        map(deviceInfo?.device?.settings, (setting, key) => ({ ...setting, key })),
        (setting: DeviceSettingList) => setting['type'] === 'list',
      ) as (DeviceSettingList & { key: string })[],
    [deviceInfo?.device?.settings],
  );

  const handleHLSJSToogle = useCallback(
    (checked: boolean) => {
      setIsHLSJSActive(checked);
    },
    [setIsHLSJSActive],
  );

  const handleAC3ByDefaultToogle = useCallback(
    (checked: boolean) => {
      setIsAC3ByDefaultActive(checked);
    },
    [setIsAC3ByDefaultActive],
  );

  const handleForcedByDefaultToogle = useCallback(
    (checked: boolean) => {
      setIsForcedByDefaultActive(checked);
    },
    [setIsForcedByDefaultActive],
  );

  const handlePauseByOKClickToogle = useCallback(
    (checked: boolean) => {
      setIsPauseByOKClickActive(checked);
    },
    [setIsPauseByOKClickActive],
  );

  const handleSwitchToHLSFromHTTPToogle = useCallback(
    (checked: boolean) => {
      setIsSwitchToHLSFromHTTPActive(checked);
    },
    [setIsSwitchToHLSFromHTTPActive],
  );

  const handleDefaultQualityChange = useCallback(
    (value: string) => {
      setDefaultQuality(value);
    },
    [setDefaultQuality],
  );

  const handleBoolSettingToggle = useCallback(
    (setting: typeof boolSettings[0]) => async (checked: boolean) => {
      setNewSettings({ ...newSettings, [setting['key']]: checked ? Bool.True : Bool.False });
    },
    [newSettings],
  );
  const handleListSettingSelect = useCallback(
    (setting: typeof listSettings[0]) => (value: number) => {
      setNewSettings({ ...newSettings, [setting['key']]: setting.value[value].id });
    },
    [newSettings],
  );

  const handleSaveClick = useCallback(async () => {
    await saveDeviceSettingsAsync([deviceInfo?.device.id!, newSettings]);

    window.location.reload();
  }, [newSettings, deviceInfo?.device, saveDeviceSettingsAsync]);
  const handleLogoutClick = useCallback(() => {
    deactivate([]);
  }, [deactivate]);

  return (
    <>
      <Seo title="Настройки устройства" />
      <div className="h-screen relative">
        <Title>Настройки устройства</Title>

        <div className="flex flex-col">
          {deviceInfo?.device && (
            <>
              <div>
                <div className="flex flex-wrap pb-4" key={`bool-${deviceInfo?.device.updated}`}>
                  {map(boolSettings, (setting) => (
                    <div className="flex w-1/2 pr-4" key={setting['key']}>
                      <SettingBool setting={setting} onChange={handleBoolSettingToggle(setting)} />
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap pb-4">
                  <div className="flex w-1/2 pr-4">
                    <Checkbox className="w-full" defaultChecked={isHLSJSActive} onChange={handleHLSJSToogle}>
                      Использовать HLS.js
                    </Checkbox>
                  </div>
                  <div className="flex w-1/2 pr-4">
                    <Checkbox className="w-full" defaultChecked={isAC3ByDefaultActive} onChange={handleAC3ByDefaultToogle}>
                      AC3 аудио по умолчанию
                    </Checkbox>
                  </div>
                  <div className="flex w-1/2 pr-4">
                    <Checkbox className="w-full" defaultChecked={isPauseByOKClickActive} onChange={handlePauseByOKClickToogle}>
                      Пауза по клику на ОК
                    </Checkbox>
                  </div>
                  <div className="flex w-1/2 pr-4">
                    <Checkbox className="w-full" defaultChecked={isForcedByDefaultActive} onChange={handleForcedByDefaultToogle}>
                      Forced субтитры по умолчанию
                    </Checkbox>
                  </div>
                  {isHTTPStreamingSelected && (
                    <div className="flex w-full pr-4">
                      <Checkbox className="w-full" defaultChecked={isSwitchToHLSFromHTTPActive} onChange={handleSwitchToHLSFromHTTPToogle}>
                        Запускать HLS поток, если на HTTP много аудиодорожек
                      </Checkbox>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap pb-4" key={`list-${deviceInfo?.device.updated}`}>
                  {map(listSettings, (setting) => (
                    <div className="flex w-1/2 pr-4" key={setting['key']}>
                      <SettingList setting={setting} onChange={handleListSettingSelect(setting)} />
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap pb-4">
                  <div className="flex w-1/2 pr-4" />
                  {(isHTTPStreamingSelected || isHLSStreamingSelected) && (
                    <div className="flex w-1/2 pr-4">
                      <Select
                        defaultValue={null}
                        value={defaultQuality}
                        onChange={handleDefaultQualityChange}
                        label="Качество по умолчанию"
                        options={qualityOptions}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex mt-4">
                <Button icon="done" onClick={handleSaveClick}>
                  Сохранить
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between absolute bottom-0 left-0 right-0 py-2">
          <div>
            <Text>Пользователь</Text>
            <div className="flex items-center">
              {data?.user && (
                <Text className="mr-4">
                  {data.user.profile.name || data.user.username} ({Math.floor(data.user.subscription.days)} дн.)
                </Text>
              )}

              <Button icon="logout" onClick={handleLogoutClick}>
                Выход
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-end pr-4">
            <Text>{hardware}</Text>
            <Text>{software}</Text>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsView;
