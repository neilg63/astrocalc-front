const showGeoLoc = (data: any, callback: Function) => {
  const { coords } = data;
  if (coords) {
    callback({
      longitude: coords.longitude,
      latitude: coords.latitude,
      alt: 20,
    });
  }
};

export const fetchGeo = (callback: Function) => {
  if (navigator.geolocation.getCurrentPosition) {
    navigator.geolocation.getCurrentPosition(
      (data) => {
        showGeoLoc(data, callback);
      },
      (error) => {
        callback(error);
      },
      { maximumAge: 60 * 60 * 1000 }
    );
  }
};

export const naturalTzOffset = (lng = 0): number => {
  return Math.floor((lng + 7.5) / 15) * 3600;
};

export const getGeoTzOffset = (): number => {
  const mins = new Date().getTimezoneOffset();
  return mins !== 0 ? 0 - mins * 60 : 0;
};
