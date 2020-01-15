let warnMessages = '';
let errorMessages = '';
export var getWarnMessages = function getWarnMessages() {
  return warnMessages;
};
export var getErrorMessages = function getErrorMessages() {
  return errorMessages;
};
export var pushWarnMessage = function pushWarnMessage(message) {
  message = message.replace(/`/g, '\\`');
  warnMessages += `${message  }\\n`;
};
export var pushErrorMessage = function pushErrorMessage(message) {
  message = message.replace(/`/g, '\\`');
  errorMessages += `${message  }\\n`;
};
export var resetMessage = function resetMessage() {
  warnMessages = '';
  errorMessages = '';
};