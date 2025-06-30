import DailyIframe, { DailyCall } from '@daily-co/daily-js';

let callObject: DailyCall | null = null;

export const getOrCreateCallObject = () => {
  if (!callObject) {
    callObject = DailyIframe.createCallObject();
  }
  return callObject;
};

export const destroyCallObject = () => {
  if (callObject) {
    callObject.destroy();
    callObject = null;
  }
};
