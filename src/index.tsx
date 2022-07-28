import React, { useEffect, useRef, useState } from "react";
import type { AnimationConfig, AnimationItem, AnimationConfigWithData } from "lottie-web";
import lottie from "lottie-web";
import type { AnimationItemAPI } from "lottie-api";
import lottieApi from "lottie-api";

interface LottieEventListener {
  eventName: Parameters<AnimationItem["addEventListener"]>[0];
  callback: Parameters<AnimationItem["addEventListener"]>[1];
}

interface LottieAnimationControl {
  [property: string]: [number, number];
}
interface LottieProps {
  animationData: AnimationConfigWithData["animationData"];

  loop?: boolean;
  autoplay?: boolean;

  renderer?: AnimationConfig["renderer"];
  assetsPath: AnimationConfig["assetsPath"];
  rendererSettings?: AnimationConfig["rendererSettings"];

  animationControl?: LottieAnimationControl;
  height?: string | number;
  width?: string | number;
  isStopped?: boolean;
  isPaused?: boolean;
  speed?: number;
  tabIndex?: number;
  direction?: 1 | -1;
  ariaRole?: string;
  ariaLabel?: string;
  title?: string;
  style?: React.CSSProperties;
  eventListeners?: LottieEventListener[];
}

const getSize = (initial?: string | number) => {
  let size;

  if (typeof initial === "number") {
    size = `${initial}px`;
  } else {
    size = initial || "100%";
  }

  return size;
};

export const Lottie = ({
  eventListeners,
  isStopped = false,
  isPaused = false,
  speed = 1,
  ariaRole = "button",
  ariaLabel = "animation",
  title = "",
  tabIndex = 0,
  width,
  height,
  style,
  loop = true,
  autoplay = true,
  animationControl,
  direction,
  assetsPath,
  animationData,
  rendererSettings,
  renderer,
}: LottieProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [animation, setAnimation] = useState<AnimationItem | null>(null);
  const [animationApi, setAnimationApi] = useState<AnimationItemAPI | null>(null);
  const lottieStyles: React.CSSProperties = {
    width: getSize(width),
    height: getSize(height),
    overflow: "hidden",
    margin: "0 auto",
    outline: "none",
    ...style,
  };

  useEffect(() => {
    if (animation) {
      eventListeners?.forEach((eventListener) => {
        animation.addEventListener(eventListener.eventName, eventListener.callback);
      });
    }

    return () => {
      if (animation) {
        eventListeners?.forEach((eventListener) => {
          animation.removeEventListener(eventListener.eventName, eventListener.callback);
        });
      }
    };
  }, [animation, eventListeners]);

  useEffect(() => {
    if (animation && loop !== undefined) {
      animation.loop = loop;
    }
  }, [animation, loop]);

  useEffect(() => {
    if (ref.current) {
      const aggregatedOptions: AnimationConfigWithData<"svg"> = {
        container: ref.current,
        renderer,
        loop: loop !== false,
        autoplay: autoplay !== false,
        animationData,
        rendererSettings,
        assetsPath,
      };

      const newAnimation = lottie.loadAnimation(aggregatedOptions);
      newAnimation.setSpeed(speed);
      newAnimation.setDirection(direction || 1);
      if (isStopped) {
        newAnimation.stop();
      } else {
        newAnimation.play();
      }
      const newApi = lottieApi.createAnimationApi(newAnimation);
      setAnimation(newAnimation);
      setAnimationApi(newApi);

      return () => {
        newAnimation.destroy();
      };
    }
    // Yes we're lying to the dependency array - oh well
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationData]);

  useEffect(() => {
    if (isStopped) {
      animation?.stop();
    } else {
      animation?.play();
    }
  }, [animation, isStopped]);

  useEffect(() => {
    if (animationControl && animationApi) {
      const properties = Object.keys(animationControl);

      properties.forEach((property) => {
        const propertyPath = animationApi.getKeyPath(property);
        const value = animationControl[property];
        animationApi.addValueCallback(propertyPath, () => value);
      });
    }
  }, [animationApi, animationControl]);

  useEffect(() => {
    animation?.setDirection(direction || 1);
  }, [animation, direction]);

  useEffect(() => {
    animation?.setSpeed(speed);
  }, [animation, speed]);

  useEffect(() => {
    if (Boolean(isPaused) !== Boolean(animation?.isPaused)) {
      animation?.pause();
    }
  }, [animation, isPaused]);

  return (
    <div ref={ref} style={lottieStyles} title={title} role={ariaRole} aria-label={ariaLabel} tabIndex={tabIndex} />
  );
};

export default Lottie;
