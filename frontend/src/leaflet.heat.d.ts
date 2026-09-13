import * as L from "leaflet";

declare module "leaflet" {
  namespace HeatLayer {
    interface Options {
      minOpacity?: number;
      maxZoom?: number;
      max?: number;
      radius?: number;
      blur?: number;
      gradient?: Record<number, string>;
    }
  }

  function heatLayer(
    latlngs: Array<[number, number, number]>,
    options?: HeatLayer.Options
  ): Layer;
}