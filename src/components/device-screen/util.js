const options = {
  autoScaleForRetina: true,
  density: Math.max(1, Math.min(1.5, devicePixelRatio || 1)),
  minscale: 0.36,
};

export const adjustBoundedSize = (w, h, device) => {
  let sw = w * options.density;
  let sh = h * options.density;
  let f;

  if (sw < (f = device.display.width * options.minscale)) {
    sw *= f / sw;
    sh *= f / sh;
  }

  if (sh < (f = device.display.height * options.minscale)) {
    sw *= f / sw;
    sh *= f / sh;
  }

  return {
    w: Math.ceil(sw),
    h: Math.ceil(sh),
  };
};

export const adjustedBoundSizeFn = (h, w, device) => {
  return adjustBoundedSize(w, h, device);
};
