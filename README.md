# Lottie for React

[![npm Version](https://img.shields.io/npm/v/lottie-react-component.svg)](https://www.npmjs.com/package/lottie-react-component) [![License](https://img.shields.io/npm/l/lottie-react-component.svg)](https://www.npmjs.com/package/lottie-react-native)

**Lottie component for React** with runtime animation control and full typescript support.

# Introduction

Lottie is a library for the Web, Android and iOS that parses [Adobe After Effects](http://www.adobe.com/products/aftereffects.html) animations exported as JSON with [bodymovin](https://github.com/bodymovin/bodymovin) and renders them natively on each platform!

For the first time, designers can create **and ship** beautiful animations without an engineer painstakingly recreating it by hand.

_This library is a [lottie-react-web](https://github.com/felippenardi/lottie-react-web) fork that adds native typescript support, esm and cjs compatibility, and a rewrite with hooks_

# Getting Started

Get started with Lottie by installing the node module with yarn or npm:

```
yarn add lottie-react-component
```

or

```
npm i --save lottie-react-component
```

# Usage

`<Lottie>` component can be used in a declarative way:

```jsx
import React from "react";
import Lottie from "lottie-react-component";
import animation from "./animation.json";

const App = () => <Lottie animationData={animation} loop />;

export default App;
```

By default it will automatically play the animation in loop.

Lottie's animation control can be set via props. Here is an example of a toggle animation that reacts on click:

```jsx
import React, { Component } from 'react';
import Lottie from 'lottie-react-component'
import toggleAnimation from './toggleAnimation.json'

export default const App = () => {
  const [isToggled, setIsToggled] = useState(false);

  return  (
    <div
      onClick={() => {
        setIsToggled(t => !t);
      }}
    >
      <Lottie
        direction={isToggled ? 1 : -1}
        animationData={toggleAnimation}
        loop={false}
      />
    </div>
  )
}

export default App
```

## API

These are all props available:

### Props

| Prop                   | Description                                                                                                                                                        | Default       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| **`animationData`**    | **Mandatory** - The source of the animation.                                                                                                                       | —             |
| **`assetsPath`**       | **Mandatory** - The root path for external assets.                                                                                                                 | `images`      |
| **`loop`**             | Play animation non-stop in a loop.                                                                                                                                 | `true`        |
| **`autoplay`**         | Automatically play animation when it is instantiated.                                                                                                              | `true`        |
| **`renderer`**         | The method for rendering the animation.                                                                                                                            | `svg`         |
| **`rendererSettings`** | Customize bodymovin aspect ratio configurations.                                                                                                                   | —             |
| **`animationControl`** | This is where you can change the animation at runtime. A key value pair of a After Effects property path and the a custom value to apply to it. See details below. | —             |
| **`width`**            | Sets the width of the animation container.                                                                                                                         | `100%`        |
| **`height`**           | Sets the heigth of the animation container.                                                                                                                        | `100%`        |
| **`isStopped`**        | A boolean flag indicating whether or not the animation is stopped.                                                                                                 | `false`       |
| **`isPaused`**         | A boolean flag indicating whether or not the animation is paused.                                                                                                  | `false`       |
| **`speed`**            | An integer indicating the speed of the animation ( `1` is `100%`.)                                                                                                 | `1`           |
| **`direction`**        | An integer indicating wether the animation progresses in the usual (`1`) or reverse (`-1`) direction                                                               | `1`           |
| **`ariaRole`**         | A string indicating the animation container `ariaRole` property                                                                                                    | `"button"`    |
| **`ariaLabel`**        | A string indicating the animation container `ariaLabel` property                                                                                                   | `"animation"` |
| **`title`**            | A string indicating the animation container `title` property                                                                                                       | `""`          |

## Changing animation at runtime

You can target an specific After Effects layer property and change it at
runtime by passing setting a `property` object on the `<Lottie>` prop. Example:

```jsx
import React from "react";
import Lottie from "lottie-react-component";
import animation from "./animation.json";

const Animation = ({ x, y }) => (
  <Lottie
    animationData={animation}
    animationControl={{
      "Square,Transform,Position": [x, y],
    }}
  />
);

export default Animation;
```

This will override the `Position` value of the layer `JoyStkCtrl01` at runtime.

Lottie is compatible with [Joystick 'n Sliders](https://aescripts.com/joysticks-n-sliders/) After Effects plugin, so you can create amazing animations easily.
