import React, { useEffect, useRef, useState } from "react";
import type { AnimationItem, AnimationConfigWithData, RendererType } from "lottie-web";
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

type ConfigOpts = AnimationConfigWithData<RendererType>;

interface LottieProps {
  animationData: AnimationConfigWithData["animationData"];

  loop?: boolean;
  autoplay?: boolean;

  renderer?: ConfigOpts["renderer"];
  assetsPath?: ConfigOpts["assetsPath"];
  rendererSettings?: ConfigOpts["rendererSettings"];

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
  if (typeof initial === "number") {
    return `${initial}px`;
  }
  return initial || "100%";
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
  const animationControlRef = useRef(animationControl);
  const playbackStateRef = useRef<{
    animation: AnimationItem;
    isStopped: boolean;
    isPaused: boolean;
  } | null>(null);
  const registeredControlsRef = useRef<{
    api: AnimationItemAPI | null;
    properties: Set<string>;
  }>({ api: null, properties: new Set() });
  animationControlRef.current = animationControl;
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
      const aggregatedOptions: AnimationConfigWithData<RendererType> = {
        container: ref.current,
        renderer,
        loop: loop !== false,
        autoplay: autoplay !== false && !isStopped && !isPaused,
        animationData,
        rendererSettings,
        assetsPath,
      };

      const newAnimation = lottie.loadAnimation(aggregatedOptions);
      newAnimation.setSpeed(speed);
      newAnimation.setDirection(direction || 1);
      let apiInitialized = false;
      const initializeApi = () => {
        if (!apiInitialized) {
          apiInitialized = true;
          setAnimationApi(lottieApi.createAnimationApi(newAnimation));
        }
      };

      newAnimation.addEventListener("DOMLoaded", initializeApi);
      setAnimation(newAnimation);
      setAnimationApi(null);
      if (newAnimation.isLoaded) {
        initializeApi();
      }

      return () => {
        newAnimation.removeEventListener("DOMLoaded", initializeApi);
        newAnimation.destroy();
      };
    }
    // Yes we're lying to the dependency array - oh well
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationData]);

  useEffect(() => {
    if (!animation) {
      return;
    }

    const previous = playbackStateRef.current;
    const isInitialState = previous?.animation !== animation;
    playbackStateRef.current = { animation, isStopped, isPaused };

    if (isStopped) {
      animation.stop();
    } else if (isPaused) {
      animation.pause();
    } else if (!isInitialState) {
      animation.play();
    }
  }, [animation, isPaused, isStopped]);

  useEffect(() => {
    if (animationControl && animationApi) {
      if (registeredControlsRef.current.api !== animationApi) {
        registeredControlsRef.current = { api: animationApi, properties: new Set() };
      }

      Object.keys(animationControl).forEach((property) => {
        if (registeredControlsRef.current.properties.has(property)) {
          return;
        }
        const propertyPath = animationApi.getKeyPath(property);
        animationApi.addValueCallback(
          propertyPath,
          (currentValue: [number, number]) => animationControlRef.current?.[property] ?? currentValue,
        );
        registeredControlsRef.current.properties.add(property);
      });
    }
  }, [animationApi, animationControl]);

  useEffect(() => {
    animation?.setDirection(direction || 1);
  }, [animation, direction]);

  useEffect(() => {
    animation?.setSpeed(speed);
  }, [animation, speed]);

  return (
    <div ref={ref} style={lottieStyles} title={title} role={ariaRole} aria-label={ariaLabel} tabIndex={tabIndex} />
  );
};

export default Lottie;
