export type LocationData = {
    coords: {
      accuracy: number;
      altitude: number;
      heading: number;
      latitude: number;
      longitude: number;
      speed: number;
    };
    extras: {
      maxCn0: number;
      meanCn0: number;
      satellites: number;
    };
    mocked: boolean;
    timestamp: number;
  };

  export type position ={
    latitude:number ,
    longitude:number 
  }