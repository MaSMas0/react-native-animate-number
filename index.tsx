import React, {useState, useEffect} from 'react';
import {Text} from 'react-native';
import Timer from 'react-timer-mixin';

const HALF_RAD = Math.PI / 2;

type TimingFunction =
  | 'linear'
  | 'easeOut'
  | 'easeIn'
  | ((interval: number, progress?: number) => number);

interface AnimateNumberProps {
  countBy?: number;
  interval?: number;
  steps?: number;
  value: number;
  timing: TimingFunction;
  formatter?: (val: number) => any;
  onProgress?: (value: number, displayValue: any) => void;
  onFinish?: (total: number, displayValue: any) => void;
  startAt?: number;
  initialValue?: number;
}

const AnimateNumber: React.FC<AnimateNumberProps> = ({
  countBy,
  interval = 2,
  steps = 45,
  value,
  timing = 'linear',
  formatter = val => val,
  onProgress = () => {},
  onFinish = () => {},
  startAt = 0,
  initialValue = 0,
}) => {
  const [state, setState] = useState({
    value: initialValue,
    displayValue: formatter(initialValue),
  });
  const [direction, setDirection] = useState<boolean>(false);
  const [startFrom, setStartFrom] = useState<number>(0);
  const [endWith, setEndWith] = useState<number>(0);
  const [dirty, setDirty] = useState<boolean>(false);

  const TimingFunctions = {
    linear: (interval: number, progress: number): number => {
      return interval;
    },

    easeOut: (interval: number, progress: number): number => {
      return interval * Math.sin(HALF_RAD * progress) * 5;
    },

    easeIn: (interval: number, progress: number): number => {
      return interval * Math.sin(HALF_RAD - HALF_RAD * progress) * 5;
    },
  };

  useEffect(() => {
    if (direction) {
      setStartFrom(state.value);
      setEndWith(value);
      setDirty(true);
      setTimeout(
        () => {
          startAnimate();
        },
        startAt != null ? startAt : 0,
      );
    }
  }, [state.displayValue, direction]);
  useEffect(() => {
    if (value !== endWith) {
      setStartFrom(endWith);
      setEndWith(value);
      setDirty(true);
      startAnimate();
    }
  }, [value]);

  const startAnimate = () => {
    const progress = getAnimationProgress();

    Timer.setTimeout(
      () => {
        let animValue = (endWith - startFrom) / steps;
        const sign = animValue >= 0 ? 1 : -1;
        if (countBy) animValue = sign * Math.abs(countBy);
        let total = state.value + animValue;

        setDirection(animValue > 0);

        if ((direction ? !(total <= endWith) : total <= endWith) === true) {
          setDirty(false);
          total = endWith;
          onFinish(total, formatter(total));
        }

        if (onProgress) onProgress(state.value, total);

        setState({
          value: total,
          displayValue: formatter(total),
        });
      },
      getTimingFunction(interval, progress),
    );
  };

  const getAnimationProgress = (): number => {
    return (state.value - startFrom) / (endWith - startFrom);
  };

  const getTimingFunction = (interval: number, progress: number): number => {
    if (typeof timing === 'string') {
      const fn = TimingFunctions[timing];
      return fn(interval, progress);
    } else if (typeof timing === 'function') return timing(interval, progress);
    else return TimingFunctions['linear'](interval, progress);
  };

  return <Text>{state.displayValue}</Text>;
};

export default AnimateNumber;
