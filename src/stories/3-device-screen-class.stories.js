// //  vendor
// import React, { Component } from "react";
// import { storiesOf } from "@storybook/react";
// import { Button } from "reactstrap";
// import CanvasDraw from "react-canvas-draw";
// import { pathOr } from "ramda";
// import Websocket from "react-websocket";

// // store
// import { CounterContext } from "../store/context";

// // socket
// import { socket } from "../socket";

// // utils
// import { VendorUtil } from "./device-screen/util";
// import ImagePool from "../utils/imagepool";

// // constants
// const BLANK_IMG =
//   "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

// var cssTransform = VendorUtil(["transform", "webkitTransform"]);

// export class DeviceList extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       device: pathOr({}, ["devices", 0], state),
//       imgSrc: BLANK_IMG,
//       cachedImageWidth: 0,
//       cachedImageHeight: 0,
//       cssRotation: 0,
//       alwaysUpright: false,
//       imagePool: new ImagePool(10),
//       screen: {
//         rotation: 0,
//         bounds: {
//           x: 0,
//           y: 0,
//           w: 0,
//           h: 0,
//         },
//       },
//       cacheScreen: {
//         rotation: 0,
//         bounds: {
//           x: 0,
//           y: 0,
//           w: 0,
//           h: 0,
//         },
//       },
//     };
//   }

//   applyQuirks(banner) {
//     document.element[0].classList.toggle(
//       "quirk-always-upright",
//       (this.state.alwaysUpright = banner.quirks.alwaysUpright)
//     );
//   }

//   hasImageAreaChanged(img) {
//     const {
//       cachedScreen,
//       screen,
//       cachedImageWidth,
//       cachedImageHeight,
//     } = this.state;

//     return (
//       cachedScreen.bounds.w !== screen.bounds.w ||
//       cachedScreen.bounds.h !== screen.bounds.h ||
//       cachedImageWidth !== img.width ||
//       cachedImageHeight !== img.height ||
//       cachedScreen.rotation !== screen.rotation
//     );
//   }

//   isRotated() {
//     const { screen } = this.state;
//     return screen.rotation === 90 || screen.rotation === 270;
//   }

//   updateImageArea(img) {
//     const { cachedImageWidth, cachedImageHeight } = this.state;
//     if (!this.hasImageAreaChanged(img)) {
//       return;
//     }

//     this.setState({
//       ...this.state,
//       cachedImageWidth: img.width,
//       cachedImageHeight: img.height,
//     });

//     if (options.autoScaleForRetina) {
//       canvas.width = cachedImageWidth * frontBackRatio;
//       canvas.height = cachedImageHeight * frontBackRatio;
//       g.scale(frontBackRatio, frontBackRatio);
//     } else {
//       canvas.width = cachedImageWidth;
//       canvas.height = cachedImageHeight;
//     }

//     setImgProps({
//       ...imgProps,
//     });
//     cssRotation += rotator(cachedScreen.rotation, screen.rotation);

//     canvas.style[cssTransform] = "rotate(" + cssRotation + "deg)";

//     setCacheScreen({
//       ...cacheScreen,
//       rotation: screen.rotation,
//       bounds: {
//         ...cacheScreen.bounds,
//         h: screen.bounds.h,
//         w: screen.bounds.w,
//       },
//     });

//     canvasAspect = canvas.width / canvas.height;

//     if (isRotated() && !alwaysUpright) {
//       canvasAspect = img.height / img.width;
//       element[0].classList.add("rotated");
//     } else {
//       canvasAspect = img.width / img.height;
//       element[0].classList.remove("rotated");
//     }

//     if (alwaysUpright) {
//       // If the screen image is always in upright position (but we
//       // still want the rotation animation), we need to cancel out
//       // the rotation by using another rotation.
//       positioner.style[cssTransform] = "rotate(" + -cssRotation + "deg)";
//     }

//     maybeFlipLetterbox();
//   }

//   listen(message) {
//     const {
//       cachedScreen,
//       cachedImageWidth,
//       cachedImageHeight,
//       cssRotation,
//       alwaysUpright,
//       imagePool,
//       device,
//     } = this.state;

//     this.setState({
//       ...this.state,
//       screen: {
//         ...this.state.screen,
//         rotation: device.display.rotation,
//       },
//     });

//     if (message.data instanceof Blob) {
//       if (device.using && ws.readyState === WebSocket.OPEN) {
//         var blob = new Blob([message.data], {
//           type: "image/jpeg",
//         });

//         var img = imagePool.next();

//         img.onload = function () {
//           updateImageArea(this);

//           g.drawImage(img, 0, 0, img.width, img.height);

//           // Try to forcefully clean everything to get rid of memory
//           // leaks. Note that despite this effort, Chrome will still
//           // leak huge amounts of memory when the developer tools are
//           // open, probably to save the resources for inspection. When
//           // the developer tools are closed no memory is leaked.
//           img.onload = img.onerror = null;
//           img.src = BLANK_IMG;
//           img = null;
//           blob = null;

//           URL.revokeObjectURL(url);
//           url = null;
//         };

//         img.onerror = function () {
//           // Happily ignore. I suppose this shouldn't happen, but
//           // sometimes it does, presumably when we're loading images
//           // too quickly.

//           // Do the same cleanup here as in onload.
//           img.onload = img.onerror = null;
//           img.src = BLANK_IMG;
//           img = null;
//           blob = null;

//           URL.revokeObjectURL(url);
//           url = null;
//         };

//         var url = URL.createObjectURL(blob);
//         img.src = url;
//       }
//     } else if (/^start /.test(message.data)) {
//       applyQuirks(JSON.parse(message.data.substr("start ".length)));
//     }
//   }

//   componentWillMount() {
//     if (device.serial) {
//       const ws = new WebSocket(device.display.url);
//       ws.binaryType = "blob";

//       ws.onerror = function errorListener() {
//         // @todo Handle
//       };

//       ws.onclose = function closeListener() {
//         // @todo Maybe handle
//       };

//       ws.onopen = function openListener() {
//         // things to do on connections opened
//       };

//       ws.onmessage = this.listen;
//     }
//   }

//   getLogs = () => {};

//   stopLogs = () => {};

//   clearLogs = () => dispatch({ type: "CLEAR_LOGS" });

//   render() {
//     return (
//       <CounterContext.Consumer>
//         Device: {device.marketName}
//         <div>
//           <Button color="primary" onClick={getLogs}>
//             Portrait
//           </Button>
//           <Button color="primary" onClick={stopLogs}>
//             Landscape
//           </Button>
//           <Button color="danger" onClick={clearLogs}>
//             HIDE Screen
//           </Button>
//         </div>
//         <CanvasDraw imgSrc={imgSrc} />
//       </CounterContext.Consumer>
//     );
//   }
// }

// storiesOf("Screen class", module).add("First Devices", () => <DeviceList />);
