export const VendorUtil = (props) => {
  var testee = document.createElement("span");
  for (var i = 0, l = props.length; i < l; ++i) {
    if (typeof testee.style[props[i]] !== "undefined") {
      return props[i];
    }
  }
  return props[0];
};

export function ImagePool(size) {
  this.size = size;
  this.images = [];
  this.counter = 0;
}

ImagePool.prototype.next = function () {
  if (this.images.length < this.size) {
    var image = new Image();
    this.images.push(image);
    return image;
  } else {
    if (this.counter >= this.size) {
      // Reset for unlikely but theoretically possible overflow.
      this.counter = 0;
    }
    return this.images[this.counter++ % this.size];
  }
};

var mapping = {
  0: {
    0: 0,
    90: -90,
    180: -180,
    270: 90,
  },
  90: {
    0: 90,
    90: 0,
    180: -90,
    270: 180,
  },
  180: {
    0: 180,
    90: 90,
    180: 0,
    270: -90,
  },
  270: {
    0: -90,
    90: -180,
    180: 90,
    270: 0,
  },
};

export function rotator(oldRotation, newRotation) {
  var r1 = oldRotation < 0 ? 360 + (oldRotation % 360) : oldRotation % 360;
  var r2 = newRotation < 0 ? 360 + (newRotation % 360) : newRotation % 360;

  return mapping[r1][r2];
}

export function isRotated(screen) {
  return screen.rotation === 90 || screen.rotation === 270;
}

export function vendorBackingStorePixelRatio(g) {
  return (
    g.webkitBackingStorePixelRatio ||
    g.mozBackingStorePixelRatio ||
    g.msBackingStorePixelRatio ||
    g.oBackingStorePixelRatio ||
    g.backingStorePixelRatio ||
    1
  );
}

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

export const adjustedBoundSizeFn = (h, w, device, screen) => {
  switch (screen.rotation) {
    case 90:
    case 270:
      return adjustBoundedSize(h, w, device);
    case 0:
    case 180:
    /* falls through */
    default:
      return adjustBoundedSize(w, h, device);
  }
};
