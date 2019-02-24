"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
/// <reference path="../External/qunit.d.ts" />
/** Wrapper around QUnit asserts. This class has two purposes:
 * - Make Assertion methods easy to discover.
 * - Make them consistent with XUnit assertions in the order of the actual and expected parameter values.
 */
var Assert = /** @class */ (function () {
    function Assert() {
    }
    /**
    * A deep recursive comparison assertion, working on primitive types, arrays, objects,
    * regular expressions, dates and functions.
    *
    * The deepEqual() assertion can be used just like equal() when comparing the value of
    * objects, such that { key: value } is equal to { key: value }. For non-scalar values,
    * identity will be disregarded by deepEqual.
    *
    * @param expected Known comparison value
    * @param actual Object or Expression being tested
    * @param message A short description of the assertion
    */
    Assert.deepEqual = function (expected, actual, message) {
        return deepEqual(actual, expected, message);
    };
    /**
    * A non-strict comparison assertion, roughly equivalent to JUnit assertEquals.
    *
    * The equal assertion uses the simple comparison operator (==) to compare the actual
    * and expected arguments. When they are equal, the assertion passes: any; otherwise, it fails.
    * When it fails, both actual and expected values are displayed in the test result,
    * in addition to a given message.
    *
    * @param expected Known comparison value
    * @param actual Expression being tested
    * @param message A short description of the assertion
    */
    Assert.equal = function (expected, actual, message) {
        return equal(actual, expected, message);
    };
    /**
    * An inverted deep recursive comparison assertion, working on primitive types,
    * arrays, objects, regular expressions, dates and functions.
    *
    * The notDeepEqual() assertion can be used just like equal() when comparing the
    * value of objects, such that { key: value } is equal to { key: value }. For non-scalar
    * values, identity will be disregarded by notDeepEqual.
    *
    * @param expected Known comparison value
    * @param actual Object or Expression being tested
    * @param message A short description of the assertion
    */
    Assert.notDeepEqual = function (expected, actual, message) {
        return notDeepEqual(actual, expected, message);
    };
    /**
    * A non-strict comparison assertion, checking for inequality.
    *
    * The notEqual assertion uses the simple inverted comparison operator (!=) to compare
    * the actual and expected arguments. When they aren't equal, the assertion passes: any;
    * otherwise, it fails. When it fails, both actual and expected values are displayed
    * in the test result, in addition to a given message.
    *
    * @param expected Known comparison value
    * @param actual Expression being tested
    * @param message A short description of the assertion
    */
    Assert.notEqual = function (expected, actual, message) {
        return notEqual(actual, expected, message);
    };
    Assert.notPropEqual = function (expected, actual, message) {
        return notPropEqual(actual, expected, message);
    };
    Assert.propEqual = function (expected, actual, message) {
        return propEqual(actual, expected, message);
    };
    /**
    * A non-strict comparison assertion, checking for inequality.
    *
    * The notStrictEqual assertion uses the strict inverted comparison operator (!==)
    * to compare the actual and expected arguments. When they aren't equal, the assertion
    * passes: any; otherwise, it fails. When it fails, both actual and expected values are
    * displayed in the test result, in addition to a given message.
    *
    * @param expected Known comparison value
    * @param actual Expression being tested
    * @param message A short description of the assertion
    */
    Assert.notStrictEqual = function (expected, actual, message) {
        return notStrictEqual(actual, expected, message);
    };
    /**
    * A boolean assertion, equivalent to CommonJS's assert.ok() and JUnit's assertTrue().
    * Passes if the first argument is truthy.
    *
    * The most basic assertion in QUnit, ok() requires just one argument. If the argument
    * evaluates to true, the assertion passes; otherwise, it fails. If a second message
    * argument is provided, it will be displayed in place of the result.
    *
    * @param state Expression being tested
    * @param message A short description of the assertion
    */
    Assert.ok = function (state, message) {
        return ok(state, message);
    };
    /**
    * A strict type and value comparison assertion.
    *
    * The strictEqual() assertion provides the most rigid comparison of type and value with
    * the strict equality operator (===)
    *
    * @param expected Known comparison value
    * @param actual Expression being tested
    * @param message A short description of the assertion
    */
    Assert.strictEqual = function (expected, actual, message) {
        return strictEqual(actual, expected, message);
    };
    Assert.throws = function (block, expected, message) {
        return throws(block, expected, message);
    };
    return Assert;
}());
/** Defines a test case */
var TestCase = /** @class */ (function () {
    function TestCase() {
    }
    return TestCase;
}());
/// <reference path="../External/sinon.d.ts" />
/// <reference path="../External/qunit.d.ts" />
/// <reference path="Assert.ts" />
/// <reference path="./TestCase.ts"/>
var TestClass = /** @class */ (function () {
    function TestClass(name) {
        /** Turns on/off sinon's syncronous implementation of setTimeout. On by default. */
        this.useFakeTimers = true;
        /** Turns on/off sinon's fake implementation of XMLHttpRequest. On by default. */
        this.useFakeServer = true;
        QUnit.module(name);
    }
    /** Method called before the start of each test method */
    TestClass.prototype.testInitialize = function () {
    };
    /** Method called after each test method has completed */
    TestClass.prototype.testCleanup = function () {
    };
    /** Method in which test class intances should call this.testCase(...) to register each of this suite's tests. */
    TestClass.prototype.registerTests = function () {
    };
    /** Register an async Javascript unit testcase. */
    TestClass.prototype.testCaseAsync = function (testInfo) {
        var _this = this;
        if (!testInfo.name) {
            throw new Error("Must specify name in testInfo context in registerTestcase call");
        }
        if (isNaN(testInfo.stepDelay)) {
            throw new Error("Must specify 'stepDelay' period between pre and post");
        }
        if (!testInfo.steps) {
            throw new Error("Must specify 'steps' to take asynchronously");
        }
        // Create a wrapper around the test method so we can do test initilization and cleanup.
        var testMethod = function (assert) {
            var done = assert.async();
            // Save off the instance of the currently running suite.
            TestClass.currentTestClass = _this;
            // Run the test.
            try {
                _this._testStarting();
                var steps = testInfo.steps;
                var trigger = function () {
                    if (steps.length) {
                        var step = steps.shift();
                        // The callback which activates the next test step. 
                        var nextTestStepTrigger = function () {
                            setTimeout(function () {
                                trigger();
                            }, testInfo.stepDelay);
                        };
                        // There 2 types of test steps - simple and polling.
                        // Upon completion of the simple test step the next test step will be called.
                        // In case of polling test step the next test step is passed to the polling test step, and
                        // it is responsibility of the polling test step to call the next test step.
                        try {
                            if (step[TestClass.isPollingStepFlag]) {
                                step.call(_this, nextTestStepTrigger);
                            }
                            else {
                                step.call(_this);
                                nextTestStepTrigger.call(_this);
                            }
                        }
                        catch (e) {
                            _this._testCompleted();
                            Assert.ok(false, e.toString());
                            // done is QUnit callback indicating the end of the test
                            done();
                            return;
                        }
                    }
                    else {
                        _this._testCompleted();
                        // done is QUnit callback indicating the end of the test
                        done();
                    }
                };
                trigger();
            }
            catch (ex) {
                Assert.ok(false, "Unexpected Exception: " + ex);
                _this._testCompleted(true);
                // done is QUnit callback indicating the end of the test
                done();
            }
        };
        // Register the test with QUnit
        QUnit.test(testInfo.name, testMethod);
    };
    /** Register a Javascript unit testcase. */
    TestClass.prototype.testCase = function (testInfo) {
        var _this = this;
        if (!testInfo.name) {
            throw new Error("Must specify name in testInfo context in registerTestcase call");
        }
        if (!testInfo.test) {
            throw new Error("Must specify 'test' method in testInfo context in registerTestcase call");
        }
        // Create a wrapper around the test method so we can do test initilization and cleanup.
        var testMethod = function () {
            // Save off the instance of the currently running suite.
            TestClass.currentTestClass = _this;
            // Run the test.
            try {
                _this._testStarting();
                testInfo.test.call(_this);
                _this._testCompleted();
            }
            catch (ex) {
                Assert.ok(false, "Unexpected Exception: " + ex);
                _this._testCompleted(true);
            }
        };
        // Register the test with QUnit
        test(testInfo.name, testMethod);
    };
    /** Called when the test is starting. */
    TestClass.prototype._testStarting = function () {
        // Initialize the sandbox similar to what is done in sinon.js "test()" override. See note on class.
        var config = sinon.getConfig(sinon.config);
        config.useFakeTimers = this.useFakeTimers;
        config.useFakeServer = this.useFakeServer;
        config.injectInto = config.injectIntoThis && this || config.injectInto;
        this.sandbox = sinon.sandbox.create(config);
        this.server = this.sandbox.server;
        // Allow the derived class to perform test initialization.
        this.testInitialize();
    };
    /** Called when the test is completed. */
    TestClass.prototype._testCompleted = function (failed) {
        if (failed) {
            // Just cleanup the sandbox since the test has already failed.
            this.sandbox.restore();
        }
        else {
            // Verify the sandbox and restore.
            this.sandbox.verifyAndRestore();
        }
        this.testCleanup();
        // Clear the instance of the currently running suite.
        TestClass.currentTestClass = null;
    };
    TestClass.prototype.spy = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return null;
    };
    TestClass.prototype.stub = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return null;
    };
    /** Creates a mock for the provided object.Does not change the object, but returns a mock object to set expectations on the object's methods. */
    TestClass.prototype.mock = function (object) { return null; };
    /**** end: Sinon methods and properties ***/
    /** Sends a JSON response to the provided request.
     * @param request The request to respond to.
     * @param data Data to respond with.
     * @param errorCode Optional error code to send with the request, default is 200
    */
    TestClass.prototype.sendJsonResponse = function (request, data, errorCode) {
        if (errorCode === undefined) {
            errorCode = 200;
        }
        request.respond(errorCode, { "Content-Type": "application/json" }, JSON.stringify(data));
    };
    TestClass.prototype.setUserAgent = function (userAgent) {
        Object.defineProperty(window.navigator, 'userAgent', {
            configurable: true,
            get: function () {
                return userAgent;
            }
        });
    };
    TestClass.isPollingStepFlag = "isPollingStep";
    return TestClass;
}());
// Configure Sinon
sinon.assert.fail = function (msg) {
    Assert.ok(false, msg);
};
sinon.assert.pass = function (assertion) {
    Assert.ok(assertion, "sinon assert");
};
sinon.config = {
    injectIntoThis: true,
    injectInto: null,
    properties: ["spy", "stub", "mock", "clock", "sandbox"],
    useFakeTimers: true,
    useFakeServer: true
};
/// <reference path="../External/qunit.d.ts" />
/// <reference path="TestClass.ts" />
var PollingAssert = /** @class */ (function () {
    function PollingAssert() {
    }
    /**
    * Starts polling assertion function for a period of time after which it's considered failed.
    * @param {() => boolean} assertionFunctionReturnsBoolean - funciton returning true if condition passes and false if condition fails. Assertion will be done on this function's result.
    * @param {string} assertDescription - message shown with the assertion
    * @param {number} timeoutSeconds - timeout in seconds after which assertion fails
    * @param {number} pollIntervalMs - polling interval in milliseconds
    * @returns {(nextTestStep) => void} callback which will be invoked by the TestClass
    */
    PollingAssert.createPollingAssert = function (assertionFunctionReturnsBoolean, assertDescription, timeoutSeconds, pollIntervalMs) {
        var _this = this;
        if (timeoutSeconds === void 0) { timeoutSeconds = 30; }
        if (pollIntervalMs === void 0) { pollIntervalMs = 500; }
        var pollingAssert = function (nextTestStep) {
            var timeout = new Date(new Date().getTime() + timeoutSeconds * 1000);
            var polling = function () {
                if (assertionFunctionReturnsBoolean.apply(_this)) {
                    Assert.ok(true, assertDescription);
                    nextTestStep();
                }
                else if (timeout < new Date()) {
                    Assert.ok(false, "assert didn't succeed for " + timeout + " seconds: " + assertDescription);
                    nextTestStep();
                }
                else {
                    setTimeout(polling, pollIntervalMs);
                }
            };
            setTimeout(polling, pollIntervalMs);
        };
        pollingAssert[TestClass.isPollingStepFlag] = true;
        return pollingAssert;
    };
    return PollingAssert;
}());
/// <reference path="../External/sinon.d.ts" />
/// <reference path="../External/qunit.d.ts" />
/// <reference path="Assert.ts" />
/// <reference path="PollingAssert.ts" />
/// <reference path="TestClass.ts" />
/// <reference path="TestCase.ts" /> 
define("src/Interfaces", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("src/SendBuffer", ["require", "exports", "@microsoft/applicationinsights-common", "@microsoft/applicationinsights-core-js"], function (require, exports, applicationinsights_common_1, applicationinsights_core_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /*
     * An array based send buffer.
     */
    var ArraySendBuffer = /** @class */ (function () {
        function ArraySendBuffer(config) {
            this._config = config;
            this._buffer = [];
        }
        ArraySendBuffer.prototype.enqueue = function (payload) {
            this._buffer.push(payload);
        };
        ArraySendBuffer.prototype.count = function () {
            return this._buffer.length;
        };
        ArraySendBuffer.prototype.clear = function () {
            this._buffer.length = 0;
        };
        ArraySendBuffer.prototype.getItems = function () {
            return this._buffer.slice(0);
        };
        ArraySendBuffer.prototype.batchPayloads = function (payload) {
            if (payload && payload.length > 0) {
                var batch = this._config.emitLineDelimitedJson() ?
                    payload.join("\n") :
                    "[" + payload.join(",") + "]";
                return batch;
            }
            return null;
        };
        ArraySendBuffer.prototype.markAsSent = function (payload) {
            this.clear();
        };
        ArraySendBuffer.prototype.clearSent = function (payload) {
            // not supported
        };
        return ArraySendBuffer;
    }());
    exports.ArraySendBuffer = ArraySendBuffer;
    /*
     * Session storege buffer holds a copy of all unsent items in the browser session storage.
     */
    var SessionStorageSendBuffer = /** @class */ (function () {
        function SessionStorageSendBuffer(logger, config) {
            this._bufferFullMessageSent = false;
            this._logger = logger;
            this._config = config;
            var bufferItems = this.getBuffer(SessionStorageSendBuffer.BUFFER_KEY);
            var notDeliveredItems = this.getBuffer(SessionStorageSendBuffer.SENT_BUFFER_KEY);
            this._buffer = bufferItems.concat(notDeliveredItems);
            // If the buffer has too many items, drop items from the end.
            if (this._buffer.length > SessionStorageSendBuffer.MAX_BUFFER_SIZE) {
                this._buffer.length = SessionStorageSendBuffer.MAX_BUFFER_SIZE;
            }
            // update DataLossAnalyzer with the number of recovered items
            // Uncomment if you want to use DataLossanalyzer
            // DataLossAnalyzer.itemsRestoredFromSessionBuffer = this._buffer.length;
            this.setBuffer(SessionStorageSendBuffer.SENT_BUFFER_KEY, []);
            this.setBuffer(SessionStorageSendBuffer.BUFFER_KEY, this._buffer);
        }
        SessionStorageSendBuffer.prototype.enqueue = function (payload) {
            if (this._buffer.length >= SessionStorageSendBuffer.MAX_BUFFER_SIZE) {
                // sent internal log only once per page view
                if (!this._bufferFullMessageSent) {
                    this._logger.throwInternal(applicationinsights_core_js_1.LoggingSeverity.WARNING, applicationinsights_core_js_1._InternalMessageId.SessionStorageBufferFull, "Maximum buffer size reached: " + this._buffer.length, true);
                    this._bufferFullMessageSent = true;
                }
                return;
            }
            this._buffer.push(payload);
            this.setBuffer(SessionStorageSendBuffer.BUFFER_KEY, this._buffer);
        };
        SessionStorageSendBuffer.prototype.count = function () {
            return this._buffer.length;
        };
        SessionStorageSendBuffer.prototype.clear = function () {
            this._buffer.length = 0;
            this.setBuffer(SessionStorageSendBuffer.BUFFER_KEY, []);
            this.setBuffer(SessionStorageSendBuffer.SENT_BUFFER_KEY, []);
            this._bufferFullMessageSent = false;
        };
        SessionStorageSendBuffer.prototype.getItems = function () {
            return this._buffer.slice(0);
        };
        SessionStorageSendBuffer.prototype.batchPayloads = function (payload) {
            if (payload && payload.length > 0) {
                var batch = this._config.emitLineDelimitedJson() ?
                    payload.join("\n") :
                    "[" + payload.join(",") + "]";
                return batch;
            }
            return null;
        };
        SessionStorageSendBuffer.prototype.markAsSent = function (payload) {
            this._buffer = this.removePayloadsFromBuffer(payload, this._buffer);
            this.setBuffer(SessionStorageSendBuffer.BUFFER_KEY, this._buffer);
            var sentElements = this.getBuffer(SessionStorageSendBuffer.SENT_BUFFER_KEY);
            if (sentElements instanceof Array && payload instanceof Array) {
                sentElements = sentElements.concat(payload);
                if (sentElements.length > SessionStorageSendBuffer.MAX_BUFFER_SIZE) {
                    // We send telemetry normally. If the SENT_BUFFER is too big we don't add new elements
                    // until we receive a response from the backend and the buffer has free space again (see clearSent method)
                    this._logger.throwInternal(applicationinsights_core_js_1.LoggingSeverity.CRITICAL, applicationinsights_core_js_1._InternalMessageId.SessionStorageBufferFull, "Sent buffer reached its maximum size: " + sentElements.length, true);
                    sentElements.length = SessionStorageSendBuffer.MAX_BUFFER_SIZE;
                }
                this.setBuffer(SessionStorageSendBuffer.SENT_BUFFER_KEY, sentElements);
            }
        };
        SessionStorageSendBuffer.prototype.clearSent = function (payload) {
            var sentElements = this.getBuffer(SessionStorageSendBuffer.SENT_BUFFER_KEY);
            sentElements = this.removePayloadsFromBuffer(payload, sentElements);
            this.setBuffer(SessionStorageSendBuffer.SENT_BUFFER_KEY, sentElements);
        };
        SessionStorageSendBuffer.prototype.removePayloadsFromBuffer = function (payloads, buffer) {
            var remaining = [];
            for (var i in buffer) {
                var contains = false;
                for (var j in payloads) {
                    if (payloads[j] === buffer[i]) {
                        contains = true;
                        break;
                    }
                }
                if (!contains) {
                    remaining.push(buffer[i]);
                }
            }
            ;
            return remaining;
        };
        SessionStorageSendBuffer.prototype.getBuffer = function (key) {
            try {
                var bufferJson = applicationinsights_common_1.Util.getSessionStorage(this._logger, key);
                if (bufferJson) {
                    var buffer = JSON.parse(bufferJson);
                    if (buffer) {
                        return buffer;
                    }
                }
            }
            catch (e) {
                this._logger.throwInternal(applicationinsights_core_js_1.LoggingSeverity.CRITICAL, applicationinsights_core_js_1._InternalMessageId.FailedToRestoreStorageBuffer, " storage key: " + key + ", " + applicationinsights_common_1.Util.getExceptionName(e), { exception: applicationinsights_common_1.Util.dump(e) });
            }
            return [];
        };
        SessionStorageSendBuffer.prototype.setBuffer = function (key, buffer) {
            try {
                var bufferJson = JSON.stringify(buffer);
                applicationinsights_common_1.Util.setSessionStorage(this._logger, key, bufferJson);
            }
            catch (e) {
                // if there was an error, clear the buffer
                // telemetry is stored in the _buffer array so we won't loose any items
                applicationinsights_common_1.Util.setSessionStorage(this._logger, key, JSON.stringify([]));
                this._logger.throwInternal(applicationinsights_core_js_1.LoggingSeverity.WARNING, applicationinsights_core_js_1._InternalMessageId.FailedToSetStorageBuffer, " storage key: " + key + ", " + applicationinsights_common_1.Util.getExceptionName(e) + ". Buffer cleared", { exception: applicationinsights_common_1.Util.dump(e) });
            }
        };
        SessionStorageSendBuffer.BUFFER_KEY = "AI_buffer";
        SessionStorageSendBuffer.SENT_BUFFER_KEY = "AI_sentBuffer";
        // Maximum number of payloads stored in the buffer. If the buffer is full, new elements will be dropped. 
        SessionStorageSendBuffer.MAX_BUFFER_SIZE = 2000;
        return SessionStorageSendBuffer;
    }());
    exports.SessionStorageSendBuffer = SessionStorageSendBuffer;
});
define("src/EnvelopeCreator", ["require", "exports", "@microsoft/applicationinsights-common", "@microsoft/applicationinsights-core-js"], function (require, exports, applicationinsights_common_2, applicationinsights_core_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ContextTagKeys = [
        "ai.application.ver",
        "ai.application.build",
        "ai.application.typeId",
        "ai.application.applicationId",
        "ai.application.layer",
        "ai.device.id",
        "ai.device.ip",
        "ai.device.language",
        "ai.device.locale",
        "ai.device.model",
        "ai.device.friendlyName",
        "ai.device.network",
        "ai.device.networkName",
        "ai.device.oemName",
        "ai.device.os",
        "ai.device.osVersion",
        "ai.device.roleInstance",
        "ai.device.roleName",
        "ai.device.screenResolution",
        "ai.device.type",
        "ai.device.machineName",
        "ai.device.vmName",
        "ai.device.browser",
        "ai.device.browserVersion",
        "ai.location.ip",
        "ai.location.country",
        "ai.location.province",
        "ai.location.city",
        "ai.operation.id",
        "ai.operation.name",
        "ai.operation.parentId",
        "ai.operation.rootId",
        "ai.operation.syntheticSource",
        "ai.operation.correlationVector",
        "ai.session.id",
        "ai.session.isFirst",
        "ai.session.isNew",
        "ai.user.accountAcquisitionDate",
        "ai.user.accountId",
        "ai.user.userAgent",
        "ai.user.id",
        "ai.user.storeRegion",
        "ai.user.authUserId",
        "ai.user.anonUserAcquisitionDate",
        "ai.user.authUserAcquisitionDate",
        "ai.cloud.name",
        "ai.cloud.role",
        "ai.cloud.roleVer",
        "ai.cloud.roleInstance",
        "ai.cloud.environment",
        "ai.cloud.location",
        "ai.cloud.deploymentUnit",
        "ai.internal.sdkVersion",
        "ai.internal.agentVersion",
        "ai.internal.nodeName",
    ];
    // these two constants are used to filter out properties not needed when trying to extract custom properties and measurements from the incoming payload
    var baseType = "baseType";
    var baseData = "baseData";
    var EnvelopeCreator = /** @class */ (function () {
        function EnvelopeCreator() {
        }
        EnvelopeCreator.extractProperties = function (data) {
            var customProperties = null;
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    var value = data[key];
                    if (typeof value !== "number") {
                        if (!customProperties) {
                            customProperties = {};
                        }
                        customProperties[key] = value;
                    }
                }
            }
            return customProperties;
        };
        EnvelopeCreator.extractPropsAndMeasurements = function (data, properties, measurements) {
            if (!applicationinsights_core_js_2.CoreUtils.isNullOrUndefined(data)) {
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        var value = data[key];
                        if (typeof value === "number") {
                            measurements[key] = value;
                        }
                        else if (typeof value === "string") {
                            properties[key] = value;
                        }
                        else {
                            properties[key] = JSON.stringify(value);
                        }
                    }
                }
            }
        };
        // TODO: Do we want this to take logger as arg or use this._logger as nonstatic?
        EnvelopeCreator.createEnvelope = function (logger, envelopeType, telemetryItem, data) {
            var envelope = new applicationinsights_common_2.Envelope(logger, data, envelopeType);
            envelope.iKey = telemetryItem.iKey;
            var iKeyNoDashes = telemetryItem.iKey.replace(/-/g, "");
            envelope.name = envelope.name.replace("{0}", iKeyNoDashes);
            // extract all extensions from ctx
            EnvelopeCreator.extractPartAExtensions(telemetryItem, envelope);
            // loop through the envelope tags (extension of Part A) and pick out the ones that should go in outgoing envelope tags
            if (!telemetryItem.tags) {
                telemetryItem.tags = [];
            }
            return envelope;
        };
        /*
         * Maps Part A data from CS 4.0
         */
        EnvelopeCreator.extractPartAExtensions = function (item, env) {
            // todo: switch to keys from common in this method
            if (!env.tags) {
                env.tags = [];
            }
            if (!item.ext) {
                item.ext = {};
            }
            if (!item.tags) {
                item.tags = [];
            }
            if (item.tags[applicationinsights_common_2.UnmappedKeys.applicationVersion]) {
                env.tags[applicationinsights_common_2.CtxTagKeys.applicationVersion] = item.tags[applicationinsights_common_2.UnmappedKeys.applicationVersion];
            }
            if (item.tags[applicationinsights_common_2.UnmappedKeys.applicationBuild]) {
                env.tags[applicationinsights_common_2.CtxTagKeys.applicationBuild] = item.tags[applicationinsights_common_2.UnmappedKeys.applicationBuild];
            }
            if (item.ext.user) {
                if (item.ext.user.authId) {
                    env.tags[applicationinsights_common_2.CtxTagKeys.userAuthUserId] = item.ext.user.authId;
                }
                if (item.ext.user.localId) {
                    env.tags[applicationinsights_common_2.CtxTagKeys.userId] = item.ext.user.localId;
                }
            }
            if (item.ext.app) {
                if (item.ext.app.sesId) {
                    env.tags[applicationinsights_common_2.CtxTagKeys.sessionId] = item.ext.app.sesId;
                }
            }
            if (item.tags[applicationinsights_common_2.CtxTagKeys.sessionIsFirst]) {
                env.tags[applicationinsights_common_2.CtxTagKeys.sessionIsFirst] = item.tags[applicationinsights_common_2.CtxTagKeys.sessionIsFirst];
            }
            if (item.ext.device) {
                if (item.ext.device.localId) {
                    env.tags[applicationinsights_common_2.CtxTagKeys.deviceId] = item.ext.device.localId;
                }
            }
            if (item.ext.ingest) {
                if (item.ext.ingest.clientIp) {
                    env.tags[applicationinsights_common_2.CtxTagKeys.deviceIp] = item.ext.ingest.clientIp;
                }
            }
            if (item.ext.web) {
                if (item.ext.web.browserLang) {
                    env.tags[applicationinsights_common_2.CtxTagKeys.deviceLanguage] = item.ext.web.browserLang;
                }
            }
            if (item.tags[applicationinsights_common_2.UnmappedKeys.deviceLocale]) {
                env.tags[applicationinsights_common_2.CtxTagKeys.deviceLocale] = item.tags[applicationinsights_common_2.UnmappedKeys.deviceLocale];
            }
            if (item.ext.device) {
                if (item.ext.device.model) {
                    env.tags[applicationinsights_common_2.CtxTagKeys.deviceModel] = item.ext.device.model;
                }
            }
            if (item.tags[applicationinsights_common_2.UnmappedKeys.deviceNetwork]) {
                env.tags[applicationinsights_common_2.CtxTagKeys.deviceNetwork] = item.tags[applicationinsights_common_2.UnmappedKeys.deviceNetwork];
            }
            if (item.tags[applicationinsights_common_2.UnmappedKeys.deviceOEMName]) {
                env.tags[applicationinsights_common_2.CtxTagKeys.deviceOEMName] = item.tags[applicationinsights_common_2.UnmappedKeys.deviceOEMName];
            }
            if (item.tags[applicationinsights_common_2.UnmappedKeys.deviceOSVersion]) {
                env.tags[applicationinsights_common_2.CtxTagKeys.deviceOSVersion] = item.tags[applicationinsights_common_2.UnmappedKeys.deviceOSVersion];
            }
            if (item.ext.os) {
                if (item.ext.os.deviceOS) {
                    env.tags[applicationinsights_common_2.CtxTagKeys.deviceOS] = item.ext.os.deviceOS;
                }
            }
            if (item.tags[applicationinsights_common_2.UnmappedKeys.deviceNetwork]) {
                env.tags[applicationinsights_common_2.CtxTagKeys.deviceNetwork] = item.tags[applicationinsights_common_2.UnmappedKeys.deviceNetwork];
            }
            if (item.ext.device) {
                if (item.ext.device.deviceType) {
                    env.tags[applicationinsights_common_2.CtxTagKeys.deviceType] = item.ext.device.deviceType;
                }
            }
            if (item.tags[applicationinsights_common_2.UnmappedKeys.deviceOSVersion]) {
                env.tags[applicationinsights_common_2.CtxTagKeys.deviceOSVersion] = item.tags[applicationinsights_common_2.UnmappedKeys.deviceOSVersion];
            }
            if (item.ext.web) {
                if (item.ext.web.screenRes) {
                    env.tags[applicationinsights_common_2.CtxTagKeys.deviceScreenResolution] = item.ext.web.screenRes;
                }
            }
            if (item.tags[applicationinsights_common_2.SampleRate]) {
                env.tags.sampleRate = item.tags[applicationinsights_common_2.SampleRate];
            }
            if (item.tags[applicationinsights_common_2.CtxTagKeys.locationIp]) {
                env.tags[applicationinsights_common_2.CtxTagKeys.locationIp] = item.tags[applicationinsights_common_2.CtxTagKeys.locationIp];
            }
            if (item.tags[applicationinsights_common_2.CtxTagKeys.internalSdkVersion]) {
                env.tags[applicationinsights_common_2.CtxTagKeys.internalSdkVersion] = item.tags[applicationinsights_common_2.CtxTagKeys.internalSdkVersion];
            }
            if (item.tags[applicationinsights_common_2.CtxTagKeys.internalAgentVersion]) {
                env.tags[applicationinsights_common_2.CtxTagKeys.internalAgentVersion] = item.tags[applicationinsights_common_2.CtxTagKeys.internalAgentVersion];
            }
            // No support for mapping Trace.traceState to 2.0 as it is currently empty
            if (item.ext.trace) {
                if (item.ext.trace.parentID) {
                    env.tags[applicationinsights_common_2.CtxTagKeys.operationParentId] = item.ext.trace.parentID;
                }
                if (item.ext.trace.traceID) {
                    env.tags[applicationinsights_common_2.CtxTagKeys.operationId] = item.ext.trace.traceID;
                }
            }
            // Sample 4.0 schema
            //  {
            //     "time" : "2018-09-05T22:51:22.4936Z",
            //     "name" : "MetricWithNamespace",
            //     "iKey" : "ABC-5a4cbd20-e601-4ef5-a3c6-5d6577e4398e",
            //     "ext": {  "cloud": {
            //          "role": "WATSON3",
            //          "roleInstance": "CO4AEAP00000260"
            //      }, 
            //      "device": {}, "correlation": {} },
            //      "tags": [
            //        { "amazon.region" : "east2" },
            //        { "os.expid" : "wp:02df239" }
            //     ]
            //   }
            // remaining items in tags, attempt to map to 2.0 schema
            item.tags.forEach(function (tag) {
                var _loop_1 = function (key) {
                    if (env.tags.key) {
                        return "continue";
                    }
                    exports.ContextTagKeys.forEach(function (ct) {
                        if (ct.indexOf(key) > 0) {
                            env.tags[ct] = tag[key];
                        }
                    });
                };
                for (var key in tag) {
                    _loop_1(key);
                }
            });
        };
        return EnvelopeCreator;
    }());
    exports.EnvelopeCreator = EnvelopeCreator;
    var DependencyEnvelopeCreator = /** @class */ (function (_super) {
        __extends(DependencyEnvelopeCreator, _super);
        function DependencyEnvelopeCreator() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DependencyEnvelopeCreator.prototype.Create = function (logger, telemetryItem) {
            this._logger = logger;
            if (applicationinsights_core_js_2.CoreUtils.isNullOrUndefined(telemetryItem.baseData)) {
                this._logger.throwInternal(applicationinsights_core_js_2.LoggingSeverity.CRITICAL, applicationinsights_core_js_2._InternalMessageId.TelemetryEnvelopeInvalid, "telemetryItem.baseData cannot be null.");
            }
            var customMeasurements = {};
            var customProperties = {};
            EnvelopeCreator.extractPropsAndMeasurements(telemetryItem.data, customProperties, customMeasurements);
            var bd = telemetryItem.baseData;
            if (applicationinsights_core_js_2.CoreUtils.isNullOrUndefined(bd)) {
                logger.warnToConsole("Invalid input for dependency data");
                return null;
            }
            var id = bd.id;
            var absoluteUrl = bd.target;
            var command = bd.name;
            var duration = bd.duration;
            var success = bd.success;
            var resultCode = bd.responseCode;
            var requestAPI = bd.type;
            var method = bd.properties && bd.properties[applicationinsights_common_2.HttpMethod] ? bd.properties[applicationinsights_common_2.HttpMethod] : "GET";
            var baseData = new applicationinsights_common_2.RemoteDependencyData(logger, id, absoluteUrl, command, duration, success, resultCode, method, requestAPI, customProperties, customMeasurements);
            var data = new applicationinsights_common_2.Data(applicationinsights_common_2.RemoteDependencyData.dataType, baseData);
            return EnvelopeCreator.createEnvelope(logger, applicationinsights_common_2.RemoteDependencyData.envelopeType, telemetryItem, data);
        };
        DependencyEnvelopeCreator.DependencyEnvelopeCreator = new DependencyEnvelopeCreator();
        return DependencyEnvelopeCreator;
    }(EnvelopeCreator));
    exports.DependencyEnvelopeCreator = DependencyEnvelopeCreator;
    var EventEnvelopeCreator = /** @class */ (function (_super) {
        __extends(EventEnvelopeCreator, _super);
        function EventEnvelopeCreator() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EventEnvelopeCreator.prototype.Create = function (logger, telemetryItem) {
            this._logger = logger;
            if (applicationinsights_core_js_2.CoreUtils.isNullOrUndefined(telemetryItem.baseData)) {
                this._logger.throwInternal(applicationinsights_core_js_2.LoggingSeverity.CRITICAL, applicationinsights_core_js_2._InternalMessageId.TelemetryEnvelopeInvalid, "telemetryItem.baseData cannot be null.");
            }
            var customProperties = {};
            var customMeasurements = {};
            if (telemetryItem.baseType === applicationinsights_common_2.Event.dataType) {
                customProperties = telemetryItem.baseData.properties || {};
                customMeasurements = telemetryItem.baseData.measurements || {};
            }
            else {
                if (telemetryItem.baseData) {
                    EnvelopeCreator.extractPropsAndMeasurements(telemetryItem.baseData, customProperties, customMeasurements);
                }
            }
            // Exract root level properties from part C telemetryItem.data
            EnvelopeCreator.extractPropsAndMeasurements(telemetryItem.data, customProperties, customMeasurements);
            var eventName = telemetryItem.baseData.name;
            var baseData = new applicationinsights_common_2.Event(logger, eventName, customProperties, customMeasurements);
            var data = new applicationinsights_common_2.Data(applicationinsights_common_2.Event.dataType, baseData);
            return EnvelopeCreator.createEnvelope(logger, applicationinsights_common_2.Event.envelopeType, telemetryItem, data);
        };
        EventEnvelopeCreator.EventEnvelopeCreator = new EventEnvelopeCreator();
        return EventEnvelopeCreator;
    }(EnvelopeCreator));
    exports.EventEnvelopeCreator = EventEnvelopeCreator;
    var ExceptionEnvelopeCreator = /** @class */ (function (_super) {
        __extends(ExceptionEnvelopeCreator, _super);
        function ExceptionEnvelopeCreator() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ExceptionEnvelopeCreator.prototype.Create = function (logger, telemetryItem) {
            this._logger = logger;
            if (applicationinsights_core_js_2.CoreUtils.isNullOrUndefined(telemetryItem.baseData)) {
                this._logger.throwInternal(applicationinsights_core_js_2.LoggingSeverity.CRITICAL, applicationinsights_core_js_2._InternalMessageId.TelemetryEnvelopeInvalid, "telemetryItem.baseData cannot be null.");
            }
            var baseData = telemetryItem.baseData;
            var data = new applicationinsights_common_2.Data(applicationinsights_common_2.Exception.dataType, baseData);
            return EnvelopeCreator.createEnvelope(logger, applicationinsights_common_2.Exception.envelopeType, telemetryItem, data);
        };
        ExceptionEnvelopeCreator.ExceptionEnvelopeCreator = new ExceptionEnvelopeCreator();
        return ExceptionEnvelopeCreator;
    }(EnvelopeCreator));
    exports.ExceptionEnvelopeCreator = ExceptionEnvelopeCreator;
    var MetricEnvelopeCreator = /** @class */ (function (_super) {
        __extends(MetricEnvelopeCreator, _super);
        function MetricEnvelopeCreator() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MetricEnvelopeCreator.prototype.Create = function (logger, telemetryItem) {
            this._logger = logger;
            if (applicationinsights_core_js_2.CoreUtils.isNullOrUndefined(telemetryItem.baseData)) {
                this._logger.throwInternal(applicationinsights_core_js_2.LoggingSeverity.CRITICAL, applicationinsights_core_js_2._InternalMessageId.TelemetryEnvelopeInvalid, "telemetryItem.baseData cannot be null.");
            }
            var customProperties = EnvelopeCreator.extractProperties(telemetryItem.data);
            var name = telemetryItem.baseData.name;
            var average = telemetryItem.baseData.average;
            var sampleCount = telemetryItem.baseData.sampleCount;
            var min = telemetryItem.baseData.min;
            var max = telemetryItem.baseData.max;
            var baseData = new applicationinsights_common_2.Metric(logger, name, average, sampleCount, min, max, customProperties);
            var data = new applicationinsights_common_2.Data(applicationinsights_common_2.Metric.dataType, baseData);
            return EnvelopeCreator.createEnvelope(logger, applicationinsights_common_2.Metric.envelopeType, telemetryItem, data);
        };
        MetricEnvelopeCreator.MetricEnvelopeCreator = new MetricEnvelopeCreator();
        return MetricEnvelopeCreator;
    }(EnvelopeCreator));
    exports.MetricEnvelopeCreator = MetricEnvelopeCreator;
    var PageViewEnvelopeCreator = /** @class */ (function (_super) {
        __extends(PageViewEnvelopeCreator, _super);
        function PageViewEnvelopeCreator() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PageViewEnvelopeCreator.prototype.Create = function (logger, telemetryItem) {
            this._logger = logger;
            if (applicationinsights_core_js_2.CoreUtils.isNullOrUndefined(telemetryItem.baseData)) {
                this._logger.throwInternal(applicationinsights_core_js_2.LoggingSeverity.CRITICAL, applicationinsights_core_js_2._InternalMessageId.TelemetryEnvelopeInvalid, "telemetryItem.baseData cannot be null.");
            }
            // Since duration is not part of the domain properties in Common Schema, extract it from part C
            var duration = undefined;
            if (!applicationinsights_core_js_2.CoreUtils.isNullOrUndefined(telemetryItem.baseData) &&
                !applicationinsights_core_js_2.CoreUtils.isNullOrUndefined(telemetryItem.baseData.measurements)) {
                duration = telemetryItem.baseData.measurements.duration;
                delete telemetryItem.baseData.measurements.duration;
            }
            var bd = telemetryItem.baseData;
            var name = bd.name;
            var url = bd.uri;
            var properties = bd.properties || {};
            var measurements = bd.measurements || {};
            // refUri is a field that Breeze still does not recognize as part of Part B. For now, put it in Part C until it supports it as a domain property
            if (!applicationinsights_core_js_2.CoreUtils.isNullOrUndefined(bd.refUri)) {
                properties["refUri"] = bd.refUri;
            }
            // pageType is a field that Breeze still does not recognize as part of Part B. For now, put it in Part C until it supports it as a domain property
            if (!applicationinsights_core_js_2.CoreUtils.isNullOrUndefined(bd.pageType)) {
                properties["pageType"] = bd.pageType;
            }
            // isLoggedIn is a field that Breeze still does not recognize as part of Part B. For now, put it in Part C until it supports it as a domain property
            if (!applicationinsights_core_js_2.CoreUtils.isNullOrUndefined(bd.isLoggedIn)) {
                properties["isLoggedIn"] = bd.isLoggedIn.toString();
            }
            // pageTags is a field that Breeze still does not recognize as part of Part B. For now, put it in Part C until it supports it as a domain property
            if (!applicationinsights_core_js_2.CoreUtils.isNullOrUndefined(bd.properties)) {
                var pageTags = bd.properties;
                for (var key in pageTags) {
                    if (pageTags.hasOwnProperty(key)) {
                        properties[key] = pageTags[key];
                    }
                }
            }
            var baseData = new applicationinsights_common_2.PageView(logger, name, url, duration, properties, measurements);
            var data = new applicationinsights_common_2.Data(applicationinsights_common_2.PageView.dataType, baseData);
            return EnvelopeCreator.createEnvelope(logger, applicationinsights_common_2.PageView.envelopeType, telemetryItem, data);
        };
        PageViewEnvelopeCreator.PageViewEnvelopeCreator = new PageViewEnvelopeCreator();
        return PageViewEnvelopeCreator;
    }(EnvelopeCreator));
    exports.PageViewEnvelopeCreator = PageViewEnvelopeCreator;
    var PageViewPerformanceEnvelopeCreator = /** @class */ (function (_super) {
        __extends(PageViewPerformanceEnvelopeCreator, _super);
        function PageViewPerformanceEnvelopeCreator() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PageViewPerformanceEnvelopeCreator.prototype.Create = function (logger, telemetryItem) {
            this._logger = logger;
            if (applicationinsights_core_js_2.CoreUtils.isNullOrUndefined(telemetryItem.baseData)) {
                this._logger.throwInternal(applicationinsights_core_js_2.LoggingSeverity.CRITICAL, applicationinsights_core_js_2._InternalMessageId.TelemetryEnvelopeInvalid, "telemetryItem.baseData cannot be null.");
            }
            var bd = telemetryItem.baseData;
            var name = bd.name;
            var url = bd.url;
            var properties = bd.properties;
            var measurements = bd.measurements;
            var baseData = new applicationinsights_common_2.PageViewPerformance(logger, name, url, undefined, properties, measurements);
            var data = new applicationinsights_common_2.Data(applicationinsights_common_2.PageViewPerformance.dataType, baseData);
            return EnvelopeCreator.createEnvelope(logger, applicationinsights_common_2.PageViewPerformance.envelopeType, telemetryItem, data);
        };
        PageViewPerformanceEnvelopeCreator.PageViewPerformanceEnvelopeCreator = new PageViewPerformanceEnvelopeCreator();
        return PageViewPerformanceEnvelopeCreator;
    }(EnvelopeCreator));
    exports.PageViewPerformanceEnvelopeCreator = PageViewPerformanceEnvelopeCreator;
    var TraceEnvelopeCreator = /** @class */ (function (_super) {
        __extends(TraceEnvelopeCreator, _super);
        function TraceEnvelopeCreator() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TraceEnvelopeCreator.prototype.Create = function (logger, telemetryItem) {
            this._logger = logger;
            if (applicationinsights_core_js_2.CoreUtils.isNullOrUndefined(telemetryItem.baseData)) {
                this._logger.throwInternal(applicationinsights_core_js_2.LoggingSeverity.CRITICAL, applicationinsights_core_js_2._InternalMessageId.TelemetryEnvelopeInvalid, "telemetryItem.baseData cannot be null.");
            }
            var message = telemetryItem.baseData.message;
            var severityLevel = telemetryItem.baseData.severityLevel;
            var customProperties = EnvelopeCreator.extractProperties(telemetryItem.data);
            var baseData = new applicationinsights_common_2.Trace(logger, message, severityLevel, customProperties);
            var data = new applicationinsights_common_2.Data(applicationinsights_common_2.Trace.dataType, baseData);
            return EnvelopeCreator.createEnvelope(logger, applicationinsights_common_2.Trace.envelopeType, telemetryItem, data);
        };
        TraceEnvelopeCreator.TraceEnvelopeCreator = new TraceEnvelopeCreator();
        return TraceEnvelopeCreator;
    }(EnvelopeCreator));
    exports.TraceEnvelopeCreator = TraceEnvelopeCreator;
});
define("src/TelemetryValidation/ITypeValidator", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("src/TelemetryValidation/EventValidator", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var EventValidator = /** @class */ (function () {
        function EventValidator() {
        }
        EventValidator.prototype.Validate = function (item) {
            /* TODO re-enable once design of iTelemetryItem is finalized. Task used to track this:
            https://mseng.visualstudio.com/AppInsights/_workitems/edit/1310871
    
            // verify system properties has a ver field
            if (!item.sytemProperties || !item.sytemProperties["ver"]) {
                return false;
            }
            
            if (!item.domainProperties || !item.domainProperties["name"]) {
                return false;
            }
            */
            return true;
        };
        EventValidator.EventValidator = new EventValidator();
        return EventValidator;
    }());
    exports.EventValidator = EventValidator;
});
define("src/TelemetryValidation/TraceValidator", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TraceValidator = /** @class */ (function () {
        function TraceValidator() {
        }
        TraceValidator.prototype.Validate = function (item) {
            /* TODO re-enable once design of iTelemetryItem is finalized. Task used to track this:
             https://mseng.visualstudio.com/AppInsights/_workitems/edit/1310871
    
            // verify system properties has a ver field
            if (!item.sytemProperties ||
                !item.sytemProperties["ver"]) {
                return false;
            }
            
            if (!item.domainProperties ||
                !item.domainProperties["message"] ||
                !item.domainProperties["severityLevel"]) {
                return false;
            }
            */
            return true;
        };
        TraceValidator.TraceValidator = new TraceValidator();
        return TraceValidator;
    }());
    exports.TraceValidator = TraceValidator;
});
define("src/TelemetryValidation/ExceptionValidator", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExceptionValidator = /** @class */ (function () {
        function ExceptionValidator() {
        }
        ExceptionValidator.prototype.Validate = function (item) {
            /* TODO re-enable once design of iTelemetryItem is finalized. Task used to track this:
             https://mseng.visualstudio.com/AppInsights/_workitems/edit/1310871
    
            // verify system properties has a ver field
            if (!item.sytemProperties ||
                !item.sytemProperties["ver"]) {
                return false;
            }
    
            if (!item.domainProperties ||
                !item.domainProperties["exceptions"] ||
                !ExceptionValidator._validateExceptions(item.domainProperties["exceptions"])) {
                return false;
            }
            */
            return true;
        };
        // TODO implement validation of exceptions
        ExceptionValidator._validateExceptions = function (exceptions) {
            // typeName
            // message
            // parsedStack
            // stack
            // hasFullStack
            return true;
        };
        ExceptionValidator.ExceptionValidator = new ExceptionValidator();
        return ExceptionValidator;
    }());
    exports.ExceptionValidator = ExceptionValidator;
});
define("src/TelemetryValidation/MetricValidator", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MetricValidator = /** @class */ (function () {
        function MetricValidator() {
        }
        MetricValidator.prototype.Validate = function (event) {
            return true;
        };
        MetricValidator.MetricValidator = new MetricValidator();
        return MetricValidator;
    }());
    exports.MetricValidator = MetricValidator;
});
define("src/TelemetryValidation/PageViewPerformanceValidator", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PageViewPerformanceValidator = /** @class */ (function () {
        function PageViewPerformanceValidator() {
        }
        PageViewPerformanceValidator.prototype.Validate = function (item) {
            /* TODO re-enable once design of iTelemetryItem is finalized. Task used to track this:
             https://mseng.visualstudio.com/AppInsights/_workitems/edit/1310871
            
            // verify system properties has a ver field
            if (!item.sytemProperties ||
                !item.sytemProperties["ver"]) {
                return false;
            }
    
            if (!item.domainProperties ||
                !item.domainProperties["domProcessing"] ||
                !item.domainProperties["duration"] ||
                !item.domainProperties["name"] ||
                !item.domainProperties["networkConnect"] ||
                !item.domainProperties["perfTotal"] ||
                !item.domainProperties["receivedResponse"] ||
                !item.domainProperties["sentRequest"] ||
                !item.domainProperties["url"]) {
                return false;
            }
            */
            return true;
        };
        PageViewPerformanceValidator.PageViewPerformanceValidator = new PageViewPerformanceValidator();
        return PageViewPerformanceValidator;
    }());
    exports.PageViewPerformanceValidator = PageViewPerformanceValidator;
});
define("src/TelemetryValidation/PageViewValidator", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PageViewValidator = /** @class */ (function () {
        function PageViewValidator() {
        }
        PageViewValidator.prototype.Validate = function (item) {
            /* TODO re-enable once design of iTelemetryItem is finalized. Task used to track this:
             https://mseng.visualstudio.com/AppInsights/_workitems/edit/1310871
    
            // verify system properties has a ver field
            if (!item.sytemProperties ||
                !item.sytemProperties["ver"]) {
                return false;
            }
    
            if (!item.domainProperties ||
                !item.domainProperties["id"] ||
                !item.domainProperties["name"] ||
                !item.domainProperties["duration"] ||
                !item.domainProperties["url"]) {
                return false;
            }
            */
            return true;
        };
        PageViewValidator.PageViewValidator = new PageViewValidator();
        return PageViewValidator;
    }());
    exports.PageViewValidator = PageViewValidator;
});
define("src/TelemetryValidation/RemoteDepdencyValidator", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RemoteDepdencyValidator = /** @class */ (function () {
        function RemoteDepdencyValidator() {
        }
        RemoteDepdencyValidator.prototype.Validate = function (item) {
            /* TODO re-enable once design of iTelemetryItem is finalized. Task used to track this:
             https://mseng.visualstudio.com/AppInsights/_workitems/edit/1310871
    
            // verify system properties has a ver field
            if (!item.sytemProperties ||
                !item.sytemProperties["ver"]) {
                return false;
            }
    
            if (!item.domainProperties ||
                !item.domainProperties["id"] ||
                !item.domainProperties["name"] ||
                !item.domainProperties["resultCode"] ||
                !item.domainProperties["duration"] ||
                !item.domainProperties["success"] ||
                !item.domainProperties["data"] ||
                !item.domainProperties["target"] ||
                !item.domainProperties["type"]) {
                return false;
            }
            */
            return true;
        };
        RemoteDepdencyValidator.RemoteDepdencyValidator = new RemoteDepdencyValidator();
        return RemoteDepdencyValidator;
    }());
    exports.RemoteDepdencyValidator = RemoteDepdencyValidator;
});
define("src/Serializer", ["require", "exports", "@microsoft/applicationinsights-common", "@microsoft/applicationinsights-core-js"], function (require, exports, applicationinsights_common_3, applicationinsights_core_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Serializer = /** @class */ (function () {
        function Serializer(logger) {
            this._logger = logger;
        }
        /**
         * Serializes the current object to a JSON string.
         */
        Serializer.prototype.serialize = function (input) {
            var output = this._serializeObject(input, "root");
            return JSON.stringify(output);
        };
        Serializer.prototype._serializeObject = function (source, name) {
            var circularReferenceCheck = "__aiCircularRefCheck";
            var output = {};
            if (!source) {
                this._logger.throwInternal(applicationinsights_core_js_3.LoggingSeverity.CRITICAL, applicationinsights_core_js_3._InternalMessageId.CannotSerializeObject, "cannot serialize object because it is null or undefined", { name: name }, true);
                return output;
            }
            if (source[circularReferenceCheck]) {
                this._logger.throwInternal(applicationinsights_core_js_3.LoggingSeverity.WARNING, applicationinsights_core_js_3._InternalMessageId.CircularReferenceDetected, "Circular reference detected while serializing object", { name: name }, true);
                return output;
            }
            if (!source.aiDataContract) {
                // special case for measurements/properties/tags
                if (name === "measurements") {
                    output = this._serializeStringMap(source, "number", name);
                }
                else if (name === "properties") {
                    output = this._serializeStringMap(source, "string", name);
                }
                else if (name === "tags") {
                    output = this._serializeStringMap(source, "string", name);
                }
                else if (applicationinsights_common_3.Util.isArray(source)) {
                    output = this._serializeArray(source, name);
                }
                else {
                    this._logger.throwInternal(applicationinsights_core_js_3.LoggingSeverity.WARNING, applicationinsights_core_js_3._InternalMessageId.CannotSerializeObjectNonSerializable, "Attempting to serialize an object which does not implement ISerializable", { name: name }, true);
                    try {
                        // verify that the object can be stringified
                        JSON.stringify(source);
                        output = source;
                    }
                    catch (e) {
                        // if serialization fails return an empty string
                        this._logger.throwInternal(applicationinsights_core_js_3.LoggingSeverity.CRITICAL, applicationinsights_core_js_3._InternalMessageId.CannotSerializeObject, (e && typeof e.toString === 'function') ? e.toString() : "Error serializing object", null, true);
                    }
                }
                return output;
            }
            source[circularReferenceCheck] = true;
            for (var field in source.aiDataContract) {
                var contract = source.aiDataContract[field];
                var isRequired = (typeof contract === "function") ? (contract() & applicationinsights_common_3.FieldType.Required) : (contract & applicationinsights_common_3.FieldType.Required);
                var isHidden = (typeof contract === "function") ? (contract() & applicationinsights_common_3.FieldType.Hidden) : (contract & applicationinsights_common_3.FieldType.Hidden);
                var isArray = contract & applicationinsights_common_3.FieldType.Array;
                var isPresent = source[field] !== undefined;
                var isObject = typeof source[field] === "object" && source[field] !== null;
                if (isRequired && !isPresent && !isArray) {
                    this._logger.throwInternal(applicationinsights_core_js_3.LoggingSeverity.CRITICAL, applicationinsights_core_js_3._InternalMessageId.MissingRequiredFieldSpecification, "Missing required field specification. The field is required but not present on source", { field: field, name: name });
                    // If not in debug mode, continue and hope the error is permissible
                    continue;
                }
                if (isHidden) {
                    // Don't serialize hidden fields
                    continue;
                }
                var value;
                if (isObject) {
                    if (isArray) {
                        // special case; resurse on each object in the source array
                        value = this._serializeArray(source[field], field);
                    }
                    else {
                        // recurse on the source object in this field
                        value = this._serializeObject(source[field], field);
                    }
                }
                else {
                    // assign the source field to the output even if undefined or required
                    value = source[field];
                }
                // only emit this field if the value is defined
                if (value !== undefined) {
                    output[field] = value;
                }
            }
            delete source[circularReferenceCheck];
            return output;
        };
        Serializer.prototype._serializeArray = function (sources, name) {
            var output = undefined;
            if (!!sources) {
                if (!applicationinsights_common_3.Util.isArray(sources)) {
                    this._logger.throwInternal(applicationinsights_core_js_3.LoggingSeverity.CRITICAL, applicationinsights_core_js_3._InternalMessageId.ItemNotInArray, "This field was specified as an array in the contract but the item is not an array.\r\n", { name: name }, true);
                }
                else {
                    output = [];
                    for (var i = 0; i < sources.length; i++) {
                        var source = sources[i];
                        var item = this._serializeObject(source, name + "[" + i + "]");
                        output.push(item);
                    }
                }
            }
            return output;
        };
        Serializer.prototype._serializeStringMap = function (map, expectedType, name) {
            var output = undefined;
            if (map) {
                output = {};
                for (var field in map) {
                    var value = map[field];
                    if (expectedType === "string") {
                        if (value === undefined) {
                            output[field] = "undefined";
                        }
                        else if (value === null) {
                            output[field] = "null";
                        }
                        else if (!value.toString) {
                            output[field] = "invalid field: toString() is not defined.";
                        }
                        else {
                            output[field] = value.toString();
                        }
                    }
                    else if (expectedType === "number") {
                        if (value === undefined) {
                            output[field] = "undefined";
                        }
                        else if (value === null) {
                            output[field] = "null";
                        }
                        else {
                            var num = parseFloat(value);
                            if (isNaN(num)) {
                                output[field] = "NaN";
                            }
                            else {
                                output[field] = num;
                            }
                        }
                    }
                    else {
                        output[field] = "invalid field: " + name + " is of unknown type.";
                        this._logger.throwInternal(applicationinsights_core_js_3.LoggingSeverity.CRITICAL, output[field], null, true);
                    }
                }
            }
            return output;
        };
        return Serializer;
    }());
    exports.Serializer = Serializer;
});
define("src/Offline", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @description Monitors browser for offline events
     * @export default - Offline: Static instance of OfflineListener
     * @class OfflineListener
     */
    var OfflineListener = /** @class */ (function () {
        function OfflineListener() {
            this._onlineStatus = true;
            try {
                if (typeof window === 'undefined') {
                    this.isListening = false;
                }
                else if (window && window.addEventListener) {
                    window.addEventListener('online', this._setOnline.bind(this), false);
                    window.addEventListener('offline', this._setOffline.bind(this), false);
                    this.isListening = true;
                }
                else if (document && document.body) {
                    document.body.ononline = this._setOnline.bind(this);
                    document.body.onoffline = this._setOffline.bind(this);
                    this.isListening = true;
                }
                else if (document) {
                    document.ononline = this._setOnline.bind(this);
                    document.onoffline = this._setOffline.bind(this);
                    this.isListening = true;
                }
                else {
                    // Could not find a place to add event listener
                    this.isListening = false;
                }
            }
            catch (e) {
                //this makes react-native less angry
                this.isListening = false;
            }
        }
        OfflineListener.prototype._setOnline = function () {
            this._onlineStatus = true;
        };
        OfflineListener.prototype._setOffline = function () {
            this._onlineStatus = false;
        };
        OfflineListener.prototype.isOnline = function () {
            if (this.isListening) {
                return this._onlineStatus;
            }
            else if (navigator) {
                return navigator.onLine;
            }
            else {
                // Cannot determine online status - report as online
                return true;
            }
        };
        OfflineListener.prototype.isOffline = function () {
            return !this.isOnline();
        };
        OfflineListener.Offline = new OfflineListener;
        return OfflineListener;
    }());
    exports.OfflineListener = OfflineListener;
    exports.Offline = OfflineListener.Offline;
});
define("src/Sender", ["require", "exports", "src/SendBuffer", "src/EnvelopeCreator", "src/TelemetryValidation/EventValidator", "src/TelemetryValidation/TraceValidator", "src/TelemetryValidation/ExceptionValidator", "src/TelemetryValidation/MetricValidator", "src/TelemetryValidation/PageViewPerformanceValidator", "src/TelemetryValidation/PageViewValidator", "src/TelemetryValidation/RemoteDepdencyValidator", "src/Serializer", "@microsoft/applicationinsights-common", "@microsoft/applicationinsights-core-js", "@microsoft/applicationinsights-core-js", "src/Offline"], function (require, exports, SendBuffer_1, EnvelopeCreator_1, EventValidator_1, TraceValidator_1, ExceptionValidator_1, MetricValidator_1, PageViewPerformanceValidator_1, PageViewValidator_1, RemoteDepdencyValidator_1, Serializer_1, applicationinsights_common_4, applicationinsights_core_js_4, applicationinsights_core_js_5, Offline_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Sender = /** @class */ (function () {
        function Sender() {
            this.priority = 1001;
            /**
             * Whether XMLHttpRequest object is supported. Older version of IE (8,9) do not support it.
             */
            this._XMLHttpRequestSupported = false;
            this.identifier = "AppInsightsChannelPlugin";
        }
        Sender.prototype.pause = function () {
            throw new Error("Method not implemented.");
        };
        Sender.prototype.resume = function () {
            throw new Error("Method not implemented.");
        };
        Sender.prototype.flush = function () {
            try {
                this.triggerSend();
            }
            catch (e) {
                this._logger.throwInternal(applicationinsights_core_js_4.LoggingSeverity.CRITICAL, applicationinsights_core_js_4._InternalMessageId.FlushFailed, "flush failed, telemetry will not be collected: " + applicationinsights_common_4.Util.getExceptionName(e), { exception: applicationinsights_common_4.Util.dump(e) });
            }
        };
        Sender.prototype.teardown = function () {
            throw new Error("Method not implemented.");
        };
        Sender.prototype.initialize = function (config, core, extensions) {
            var _this = this;
            this._logger = core.logger;
            this._serializer = new Serializer_1.Serializer(core.logger);
            this._consecutiveErrors = 0;
            this._retryAt = null;
            this._lastSend = 0;
            this._sender = null;
            var defaultConfig = Sender._getDefaultAppInsightsChannelConfig();
            this._config = Sender._getEmptyAppInsightsChannelConfig();
            var _loop_2 = function (field) {
                this_1._config[field] = function () { return applicationinsights_common_4.ConfigurationManager.getConfig(config, field, _this.identifier, defaultConfig[field]()); };
            };
            var this_1 = this;
            for (var field in defaultConfig) {
                _loop_2(field);
            }
            this._buffer = (this._config.enableSessionStorageBuffer && applicationinsights_common_4.Util.canUseSessionStorage())
                ? new SendBuffer_1.SessionStorageSendBuffer(this._logger, this._config) : new SendBuffer_1.ArraySendBuffer(this._config);
            if (!this._config.isBeaconApiDisabled() && applicationinsights_common_4.Util.IsBeaconApiSupported()) {
                this._sender = this._beaconSender;
            }
            else {
                if (typeof XMLHttpRequest != "undefined") {
                    var testXhr = new XMLHttpRequest();
                    if ("withCredentials" in testXhr) {
                        this._sender = this._xhrSender;
                        this._XMLHttpRequestSupported = true;
                    }
                    else if (typeof XDomainRequest !== "undefined") {
                        this._sender = this._xdrSender; //IE 8 and 9
                    }
                }
            }
        };
        Sender.prototype.processTelemetry = function (telemetryItem) {
            var _this = this;
            try {
                // if master off switch is set, don't send any data
                if (this._config.disableTelemetry()) {
                    // Do not send/save data
                    return;
                }
                // validate input
                if (!telemetryItem) {
                    this._logger.throwInternal(applicationinsights_core_js_4.LoggingSeverity.CRITICAL, applicationinsights_core_js_4._InternalMessageId.CannotSendEmptyTelemetry, "Cannot send empty telemetry");
                    return;
                }
                // ensure a sender was constructed
                if (!this._sender) {
                    this._logger.throwInternal(applicationinsights_core_js_4.LoggingSeverity.CRITICAL, applicationinsights_core_js_4._InternalMessageId.SenderNotInitialized, "Sender was not initialized");
                    return;
                }
                // first we need to validate that the envelope passed down is valid
                var isValid = Sender._validate(telemetryItem);
                if (!isValid) {
                    this._logger.throwInternal(applicationinsights_core_js_4.LoggingSeverity.CRITICAL, applicationinsights_core_js_4._InternalMessageId.TelemetryEnvelopeInvalid, "Invalid telemetry envelope");
                    return;
                }
                // construct an envelope that Application Insights endpoint can understand
                var aiEnvelope_1 = Sender.constructEnvelope(telemetryItem, this._config.instrumentationKey(), this._logger);
                if (!aiEnvelope_1) {
                    this._logger.throwInternal(applicationinsights_core_js_4.LoggingSeverity.CRITICAL, applicationinsights_core_js_4._InternalMessageId.CreateEnvelopeError, "Unable to create an AppInsights envelope");
                    return;
                }
                var doNotSendItem_1 = false;
                // this is for running in legacy mode, where customer may already have a custom initializer present
                if (telemetryItem.tags && telemetryItem.tags[applicationinsights_common_4.ProcessLegacy]) {
                    telemetryItem.tags[applicationinsights_common_4.ProcessLegacy].forEach(function (callBack) {
                        try {
                            if (callBack && callBack(aiEnvelope_1) === false) {
                                doNotSendItem_1 = true;
                                _this._logger.warnToConsole("Telemetry processor check returns false");
                            }
                        }
                        catch (e) {
                            // log error but dont stop executing rest of the telemetry initializers
                            // doNotSendItem = true;
                            _this._logger.throwInternal(applicationinsights_core_js_4.LoggingSeverity.CRITICAL, applicationinsights_core_js_4._InternalMessageId.TelemetryInitializerFailed, "One of telemetry initializers failed, telemetry item will not be sent: " + applicationinsights_common_4.Util.getExceptionName(e), { exception: applicationinsights_common_4.Util.dump(e) }, true);
                        }
                    });
                    delete telemetryItem.tags[applicationinsights_common_4.ProcessLegacy];
                }
                if (doNotSendItem_1) {
                    return; // do not send, no need to execute next plugin
                }
                // check if the incoming payload is too large, truncate if necessary
                var payload = this._serializer.serialize(aiEnvelope_1);
                // flush if we would exceed the max-size limit by adding this item
                var bufferPayload = this._buffer.getItems();
                var batch = this._buffer.batchPayloads(bufferPayload);
                if (batch && (batch.length + payload.length > this._config.maxBatchSizeInBytes())) {
                    this.triggerSend();
                }
                // enqueue the payload
                this._buffer.enqueue(payload);
                // ensure an invocation timeout is set
                this._setupTimer();
            }
            catch (e) {
                this._logger.throwInternal(applicationinsights_core_js_4.LoggingSeverity.WARNING, applicationinsights_core_js_4._InternalMessageId.FailedAddingTelemetryToBuffer, "Failed adding telemetry to the sender's buffer, some telemetry will be lost: " + applicationinsights_common_4.Util.getExceptionName(e), { exception: applicationinsights_common_4.Util.dump(e) });
            }
            // hand off the telemetry item to the next plugin
            if (!applicationinsights_core_js_5.CoreUtils.isNullOrUndefined(this._nextPlugin)) {
                this._nextPlugin.processTelemetry(telemetryItem);
            }
        };
        Sender.prototype.setNextPlugin = function (next) {
            this._nextPlugin = next;
        };
        /**
         * xhr state changes
         */
        Sender.prototype._xhrReadyStateChange = function (xhr, payload, countOfItemsInPayload) {
            if (xhr.readyState === 4) {
                var response = null;
                if (!this._appId) {
                    response = this._parseResponse(xhr.responseText || xhr.response);
                    if (response && response.appId) {
                        this._appId = response.appId;
                    }
                }
                if ((xhr.status < 200 || xhr.status >= 300) && xhr.status !== 0) {
                    if (!this._config.isRetryDisabled() && this._isRetriable(xhr.status)) {
                        this._resendPayload(payload);
                        this._logger.throwInternal(applicationinsights_core_js_4.LoggingSeverity.WARNING, applicationinsights_core_js_4._InternalMessageId.TransmissionFailed, ". " +
                            "Response code " + xhr.status + ". Will retry to send " + payload.length + " items.");
                    }
                    else {
                        this._onError(payload, this._formatErrorMessageXhr(xhr));
                    }
                }
                else if (Offline_1.Offline.isOffline()) {
                    // Note: Don't check for staus == 0, since adblock gives this code
                    if (!this._config.isRetryDisabled()) {
                        var offlineBackOffMultiplier = 10; // arbritrary number
                        this._resendPayload(payload, offlineBackOffMultiplier);
                        this._logger.throwInternal(applicationinsights_core_js_4.LoggingSeverity.WARNING, applicationinsights_core_js_4._InternalMessageId.TransmissionFailed, ". Offline - Response Code: " + xhr.status + ". Offline status: " + Offline_1.Offline.isOffline() + ". Will retry to send " + payload.length + " items.");
                    }
                }
                else {
                    if (xhr.status === 206) {
                        if (!response) {
                            response = this._parseResponse(xhr.responseText || xhr.response);
                        }
                        if (response && !this._config.isRetryDisabled()) {
                            this._onPartialSuccess(payload, response);
                        }
                        else {
                            this._onError(payload, this._formatErrorMessageXhr(xhr));
                        }
                    }
                    else {
                        this._consecutiveErrors = 0;
                        this._onSuccess(payload, countOfItemsInPayload);
                    }
                }
            }
        };
        /**
         * Immediately send buffered data
         * @param async {boolean} - Indicates if the events should be sent asynchronously
         */
        Sender.prototype.triggerSend = function (async) {
            if (async === void 0) { async = true; }
            try {
                // Send data only if disableTelemetry is false
                if (!this._config.disableTelemetry()) {
                    if (this._buffer.count() > 0) {
                        var payload = this._buffer.getItems();
                        // invoke send
                        this._sender(payload, async);
                    }
                    // update lastSend time to enable throttling
                    this._lastSend = +new Date;
                }
                else {
                    this._buffer.clear();
                }
                clearTimeout(this._timeoutHandle);
                this._timeoutHandle = null;
                this._retryAt = null;
            }
            catch (e) {
                /* Ignore this error for IE under v10 */
                if (!applicationinsights_common_4.Util.getIEVersion() || applicationinsights_common_4.Util.getIEVersion() > 9) {
                    this._logger.throwInternal(applicationinsights_core_js_4.LoggingSeverity.CRITICAL, applicationinsights_core_js_4._InternalMessageId.TransmissionFailed, "Telemetry transmission failed, some telemetry will be lost: " + applicationinsights_common_4.Util.getExceptionName(e), { exception: applicationinsights_common_4.Util.dump(e) });
                }
            }
        };
        /**
         * error handler
         */
        Sender.prototype._onError = function (payload, message, event) {
            this._logger.throwInternal(applicationinsights_core_js_4.LoggingSeverity.WARNING, applicationinsights_core_js_4._InternalMessageId.OnError, "Failed to send telemetry.", { message: message });
            this._buffer.clearSent(payload);
        };
        /**
         * partial success handler
         */
        Sender.prototype._onPartialSuccess = function (payload, results) {
            var failed = [];
            var retry = [];
            // Iterate through the reversed array of errors so that splicing doesn't have invalid indexes after the first item.
            var errors = results.errors.reverse();
            for (var _i = 0, errors_1 = errors; _i < errors_1.length; _i++) {
                var error = errors_1[_i];
                var extracted = payload.splice(error.index, 1)[0];
                if (this._isRetriable(error.statusCode)) {
                    retry.push(extracted);
                }
                else {
                    // All other errors, including: 402 (Monthly quota exceeded) and 439 (Too many requests and refresh cache).
                    failed.push(extracted);
                }
            }
            if (payload.length > 0) {
                this._onSuccess(payload, results.itemsAccepted);
            }
            if (failed.length > 0) {
                this._onError(failed, this._formatErrorMessageXhr(null, ['partial success', results.itemsAccepted, 'of', results.itemsReceived].join(' ')));
            }
            if (retry.length > 0) {
                this._resendPayload(retry);
                this._logger.throwInternal(applicationinsights_core_js_4.LoggingSeverity.WARNING, applicationinsights_core_js_4._InternalMessageId.TransmissionFailed, "Partial success. " +
                    "Delivered: " + payload.length + ", Failed: " + failed.length +
                    ". Will retry to send " + retry.length + " our of " + results.itemsReceived + " items");
            }
        };
        /**
         * success handler
         */
        Sender.prototype._onSuccess = function (payload, countOfItemsInPayload) {
            this._buffer.clearSent(payload);
        };
        /**
         * xdr state changes
         */
        Sender.prototype._xdrOnLoad = function (xdr, payload) {
            if (xdr && (xdr.responseText + "" === "200" || xdr.responseText === "")) {
                this._consecutiveErrors = 0;
                this._onSuccess(payload, 0);
            }
            else {
                var results = this._parseResponse(xdr.responseText);
                if (results && results.itemsReceived && results.itemsReceived > results.itemsAccepted
                    && !this._config.isRetryDisabled()) {
                    this._onPartialSuccess(payload, results);
                }
                else {
                    this._onError(payload, this._formatErrorMessageXdr(xdr));
                }
            }
        };
        Sender.constructEnvelope = function (orig, iKey, logger) {
            var envelope;
            if (iKey !== orig.iKey && !applicationinsights_core_js_5.CoreUtils.isNullOrUndefined(iKey)) {
                envelope = __assign({}, orig, { iKey: iKey });
            }
            else {
                envelope = orig;
            }
            switch (envelope.baseType) {
                case applicationinsights_common_4.Event.dataType:
                    return EnvelopeCreator_1.EventEnvelopeCreator.EventEnvelopeCreator.Create(logger, envelope);
                case applicationinsights_common_4.Trace.dataType:
                    return EnvelopeCreator_1.TraceEnvelopeCreator.TraceEnvelopeCreator.Create(logger, envelope);
                case applicationinsights_common_4.PageView.dataType:
                    return EnvelopeCreator_1.PageViewEnvelopeCreator.PageViewEnvelopeCreator.Create(logger, envelope);
                case applicationinsights_common_4.PageViewPerformance.dataType:
                    return EnvelopeCreator_1.PageViewPerformanceEnvelopeCreator.PageViewPerformanceEnvelopeCreator.Create(logger, envelope);
                case applicationinsights_common_4.Exception.dataType:
                    return EnvelopeCreator_1.ExceptionEnvelopeCreator.ExceptionEnvelopeCreator.Create(logger, envelope);
                case applicationinsights_common_4.Metric.dataType:
                    return EnvelopeCreator_1.MetricEnvelopeCreator.MetricEnvelopeCreator.Create(logger, envelope);
                case applicationinsights_common_4.RemoteDependencyData.dataType:
                    return EnvelopeCreator_1.DependencyEnvelopeCreator.DependencyEnvelopeCreator.Create(logger, envelope);
                default:
                    // default create custom event type with name mapping to unknown type
                    envelope.baseData.name = envelope.baseType;
                    return EnvelopeCreator_1.EventEnvelopeCreator.EventEnvelopeCreator.Create(logger, envelope);
            }
        };
        Sender._getDefaultAppInsightsChannelConfig = function () {
            var resultConfig = {};
            // set default values
            resultConfig.endpointUrl = function () { return "https://dc.services.visualstudio.com/v2/track"; };
            resultConfig.emitLineDelimitedJson = function () { return false; };
            resultConfig.maxBatchInterval = function () { return 15000; };
            resultConfig.maxBatchSizeInBytes = function () { return 102400; }; // 100kb
            resultConfig.disableTelemetry = function () { return false; };
            resultConfig.enableSessionStorageBuffer = function () { return true; };
            resultConfig.isRetryDisabled = function () { return false; };
            resultConfig.isBeaconApiDisabled = function () { return true; };
            resultConfig.instrumentationKey = function () { return undefined; }; // Channel doesn't need iKey, it should be set already
            return resultConfig;
        };
        Sender._getEmptyAppInsightsChannelConfig = function () {
            return {
                endpointUrl: undefined,
                emitLineDelimitedJson: undefined,
                maxBatchInterval: undefined,
                maxBatchSizeInBytes: undefined,
                disableTelemetry: undefined,
                enableSessionStorageBuffer: undefined,
                isRetryDisabled: undefined,
                isBeaconApiDisabled: undefined,
                instrumentationKey: undefined
            };
        };
        Sender._validate = function (envelope) {
            // call the appropriate Validate depending on the baseType
            switch (envelope.baseType) {
                case applicationinsights_common_4.Event.dataType:
                    return EventValidator_1.EventValidator.EventValidator.Validate(envelope);
                case applicationinsights_common_4.Trace.dataType:
                    return TraceValidator_1.TraceValidator.TraceValidator.Validate(envelope);
                case applicationinsights_common_4.Exception.dataType:
                    return ExceptionValidator_1.ExceptionValidator.ExceptionValidator.Validate(envelope);
                case applicationinsights_common_4.Metric.dataType:
                    return MetricValidator_1.MetricValidator.MetricValidator.Validate(envelope);
                case applicationinsights_common_4.PageView.dataType:
                    return PageViewValidator_1.PageViewValidator.PageViewValidator.Validate(envelope);
                case applicationinsights_common_4.PageViewPerformance.dataType:
                    return PageViewPerformanceValidator_1.PageViewPerformanceValidator.PageViewPerformanceValidator.Validate(envelope);
                case applicationinsights_common_4.RemoteDependencyData.dataType:
                    return RemoteDepdencyValidator_1.RemoteDepdencyValidator.RemoteDepdencyValidator.Validate(envelope);
                default:
                    return EventValidator_1.EventValidator.EventValidator.Validate(envelope);
            }
        };
        /**
         * Send Beacon API request
         * @param payload {string} - The data payload to be sent.
         * @param isAsync {boolean} - not used
         * Note: Beacon API does not support custom headers and we are not able to get
         * appId from the backend for the correct correlation.
         */
        Sender.prototype._beaconSender = function (payload, isAsync) {
            var url = this._config.endpointUrl();
            var batch = this._buffer.batchPayloads(payload);
            // Chrome only allows CORS-safelisted values for the sendBeacon data argument
            // see: https://bugs.chromium.org/p/chromium/issues/detail?id=720283
            var plainTextBatch = new Blob([batch], { type: 'text/plain;charset=UTF-8' });
            // The sendBeacon method returns true if the user agent is able to successfully queue the data for transfer. Otherwise it returns false.
            var queued = navigator.sendBeacon(url, plainTextBatch);
            if (queued) {
                this._buffer.markAsSent(payload);
            }
            else {
                this._logger.throwInternal(applicationinsights_core_js_4.LoggingSeverity.CRITICAL, applicationinsights_core_js_4._InternalMessageId.TransmissionFailed, ". " + "Failed to send telemetry with Beacon API.");
            }
        };
        /**
         * Send XMLHttpRequest
         * @param payload {string} - The data payload to be sent.
         * @param isAsync {boolean} - Indicates if the request should be sent asynchronously
         */
        Sender.prototype._xhrSender = function (payload, isAsync) {
            var _this = this;
            var xhr = new XMLHttpRequest();
            xhr[applicationinsights_common_4.DisabledPropertyName] = true;
            xhr.open("POST", this._config.endpointUrl(), isAsync);
            xhr.setRequestHeader("Content-type", "application/json");
            // append Sdk-Context request header only in case of breeze endpoint
            if (applicationinsights_common_4.Util.isInternalApplicationInsightsEndpoint(this._config.endpointUrl())) {
                xhr.setRequestHeader(applicationinsights_common_4.RequestHeaders.sdkContextHeader, applicationinsights_common_4.RequestHeaders.sdkContextHeaderAppIdRequest);
            }
            xhr.onreadystatechange = function () { return _this._xhrReadyStateChange(xhr, payload, payload.length); };
            xhr.onerror = function (event) { return _this._onError(payload, _this._formatErrorMessageXhr(xhr), event); };
            // compose an array of payloads
            var batch = this._buffer.batchPayloads(payload);
            xhr.send(batch);
            this._buffer.markAsSent(payload);
        };
        /**
         * Parses the response from the backend.
         * @param response - XMLHttpRequest or XDomainRequest response
         */
        Sender.prototype._parseResponse = function (response) {
            try {
                if (response && response !== "") {
                    var result = JSON.parse(response);
                    if (result && result.itemsReceived && result.itemsReceived >= result.itemsAccepted &&
                        result.itemsReceived - result.itemsAccepted == result.errors.length) {
                        return result;
                    }
                }
            }
            catch (e) {
                this._logger.throwInternal(applicationinsights_core_js_4.LoggingSeverity.CRITICAL, applicationinsights_core_js_4._InternalMessageId.InvalidBackendResponse, "Cannot parse the response. " + applicationinsights_common_4.Util.getExceptionName(e), {
                    response: response
                });
            }
            return null;
        };
        /**
         * Resend payload. Adds payload back to the send buffer and setup a send timer (with exponential backoff).
         * @param payload
         */
        Sender.prototype._resendPayload = function (payload, linearFactor) {
            if (linearFactor === void 0) { linearFactor = 1; }
            if (!payload || payload.length === 0) {
                return;
            }
            this._buffer.clearSent(payload);
            this._consecutiveErrors++;
            for (var _i = 0, payload_1 = payload; _i < payload_1.length; _i++) {
                var item = payload_1[_i];
                this._buffer.enqueue(item);
            }
            // setup timer
            this._setRetryTime(linearFactor);
            this._setupTimer();
        };
        /** Calculates the time to wait before retrying in case of an error based on
         * http://en.wikipedia.org/wiki/Exponential_backoff
         */
        Sender.prototype._setRetryTime = function (linearFactor) {
            var SlotDelayInSeconds = 10;
            var delayInSeconds;
            if (this._consecutiveErrors <= 1) {
                delayInSeconds = SlotDelayInSeconds;
            }
            else {
                var backOffSlot = (Math.pow(2, this._consecutiveErrors) - 1) / 2;
                // tslint:disable-next-line:insecure-random
                var backOffDelay = Math.floor(Math.random() * backOffSlot * SlotDelayInSeconds) + 1;
                backOffDelay = linearFactor * backOffDelay;
                delayInSeconds = Math.max(Math.min(backOffDelay, 3600), SlotDelayInSeconds);
            }
            // TODO: Log the backoff time like the C# version does.
            var retryAfterTimeSpan = Date.now() + (delayInSeconds * 1000);
            // TODO: Log the retry at time like the C# version does.
            this._retryAt = retryAfterTimeSpan;
        };
        /**
         * Sets up the timer which triggers actually sending the data.
         */
        Sender.prototype._setupTimer = function () {
            var _this = this;
            if (!this._timeoutHandle) {
                var retryInterval = this._retryAt ? Math.max(0, this._retryAt - Date.now()) : 0;
                var timerValue = Math.max(this._config.maxBatchInterval(), retryInterval);
                this._timeoutHandle = setTimeout(function () {
                    _this.triggerSend();
                }, timerValue);
            }
        };
        /**
         * Checks if the SDK should resend the payload after receiving this status code from the backend.
         * @param statusCode
         */
        Sender.prototype._isRetriable = function (statusCode) {
            return statusCode == 408 // Timeout
                || statusCode == 429 // Too many requests.
                || statusCode == 500 // Internal server error.
                || statusCode == 503; // Service unavailable.
        };
        Sender.prototype._formatErrorMessageXhr = function (xhr, message) {
            if (xhr) {
                return "XMLHttpRequest,Status:" + xhr.status + ",Response:" + xhr.responseText || xhr.response || "";
            }
            return message;
        };
        /**
         * Send XDomainRequest
         * @param payload {string} - The data payload to be sent.
         * @param isAsync {boolean} - Indicates if the request should be sent asynchronously
         *
         * Note: XDomainRequest does not support sync requests. This 'isAsync' parameter is added
         * to maintain consistency with the xhrSender's contract
         * Note: XDomainRequest does not support custom headers and we are not able to get
         * appId from the backend for the correct correlation.
         */
        Sender.prototype._xdrSender = function (payload, isAsync) {
            var _this = this;
            var xdr = new XDomainRequest();
            xdr.onload = function () { return _this._xdrOnLoad(xdr, payload); };
            xdr.onerror = function (event) { return _this._onError(payload, _this._formatErrorMessageXdr(xdr), event); };
            // XDomainRequest requires the same protocol as the hosting page.
            // If the protocol doesn't match, we can't send the telemetry :(.
            var hostingProtocol = window.location.protocol;
            if (this._config.endpointUrl().lastIndexOf(hostingProtocol, 0) !== 0) {
                this._logger.throwInternal(applicationinsights_core_js_4.LoggingSeverity.WARNING, applicationinsights_core_js_4._InternalMessageId.TransmissionFailed, ". " +
                    "Cannot send XDomain request. The endpoint URL protocol doesn't match the hosting page protocol.");
                this._buffer.clear();
                return;
            }
            var endpointUrl = this._config.endpointUrl().replace(/^(https?:)/, "");
            xdr.open('POST', endpointUrl);
            // compose an array of payloads
            var batch = this._buffer.batchPayloads(payload);
            xdr.send(batch);
            this._buffer.markAsSent(payload);
        };
        Sender.prototype._formatErrorMessageXdr = function (xdr, message) {
            if (xdr) {
                return "XDomainRequest,Response:" + xdr.responseText || "";
            }
            return message;
        };
        return Sender;
    }());
    exports.Sender = Sender;
});
define("Tests/Sender.tests", ["require", "exports", "src/Sender", "src/Offline", "@microsoft/applicationinsights-common", "@microsoft/applicationinsights-core-js"], function (require, exports, Sender_1, Offline_2, applicationinsights_common_5, applicationinsights_core_js_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SenderTests = /** @class */ (function (_super) {
        __extends(SenderTests, _super);
        function SenderTests() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._instrumentationKey = 'iKey';
            return _this;
        }
        SenderTests.prototype.testInitialize = function () {
            this._sender = new Sender_1.Sender();
            this._sender.initialize({ instrumentationKey: this._instrumentationKey }, new applicationinsights_core_js_6.AppInsightsCore(), []);
        };
        SenderTests.prototype.testCleanup = function () {
            this._sender = null;
        };
        SenderTests.prototype.registerTests = function () {
            var _this = this;
            this.testCase({
                name: "Channel Config: Channel can properly take args from root config",
                test: function () {
                    _this._sender.initialize({
                        instrumentationKey: 'abc',
                        maxBatchInterval: 123,
                        endpointUrl: 'https://example.com',
                        maxBatchSizeInBytes: 654,
                        extensionConfig: (_a = {},
                            _a[_this._sender.identifier] = {
                                maxBatchSizeInBytes: 456
                            },
                            _a)
                    }, new applicationinsights_core_js_6.AppInsightsCore(), []);
                    Assert.equal(123, _this._sender._config.maxBatchInterval(), 'Channel config can be set from root config (maxBatchInterval)');
                    Assert.equal('https://example.com', _this._sender._config.endpointUrl(), 'Channel config can be set from root config (endpointUrl)');
                    Assert.notEqual(654, _this._sender._config.maxBatchSizeInBytes(), 'Channel config does not equal root config option if extensionConfig field is also set');
                    Assert.equal(456, _this._sender._config.maxBatchSizeInBytes(), 'Channel config prioritizes extensionConfig over root config');
                    var _a;
                }
            });
            this.testCase({
                name: "processTelemetry can be called with optional fields undefined",
                test: function () {
                    _this._sender.initialize({
                        instrumentationKey: 'abc'
                    }, new applicationinsights_core_js_6.AppInsightsCore(), []);
                    var loggerSpy = _this.sandbox.stub(_this._sender, "_setupTimer");
                    var telemetryItem = {
                        name: 'fake item',
                        iKey: 'iKey',
                        baseType: 'some type',
                        baseData: {}
                    };
                    try {
                        _this._sender.processTelemetry(telemetryItem);
                    }
                    catch (e) {
                        Assert.ok(false);
                    }
                    Assert.ok(loggerSpy.calledOnce);
                }
            });
            this.testCase({
                name: "telemetry is not send when legacy telemetry initializer returns false",
                test: function () {
                    var cr = new applicationinsights_core_js_6.AppInsightsCore();
                    cr.logger = new applicationinsights_core_js_6.DiagnosticLogger({ instrumentationKey: "ikey" });
                    _this._sender.initialize({
                        instrumentationKey: 'abc'
                    }, cr, []);
                    var nextPlugin = {
                        identifier: "foo",
                        processTelemetry: function (it) { },
                        priority: 200,
                        setNextPlugin: function (it) { }
                    };
                    _this._sender.setNextPlugin(nextPlugin);
                    var processTelemetrySpy = _this.sandbox.stub(_this._sender._nextPlugin, "processTelemetry");
                    var telemetryItem = {
                        name: 'fake item',
                        iKey: 'iKey',
                        baseType: 'some type',
                        baseData: {},
                        tags: []
                    };
                    telemetryItem.tags["ProcessLegacy"] = [function (e) { return true; }, function (e) { return false; }, function (f) { return true; }];
                    try {
                        _this._sender.processTelemetry(telemetryItem);
                    }
                    catch (e) {
                        Assert.ok(false);
                    }
                    Assert.ok(!processTelemetrySpy.calledOnce);
                }
            });
            this.testCase({
                name: "AppInsightsTests: AppInsights Envelope created for Custom Event",
                test: function () {
                    var inputEnvelope = {
                        name: "test",
                        time: new Date("2018-06-12").toISOString(),
                        iKey: "iKey",
                        ext: {
                            "ai.session.id": "d041d2e5fa834b4f9eee41ac163bf402",
                            "ai.device.id": "browser",
                            "ai.device.type": "Browser",
                            "ai.internal.sdkVersion": "javascript:1.0.18",
                        },
                        tags: [{}],
                        data: {
                            "property1": "val1",
                            "measurement1": 50.0,
                            "measurement2": 1.3,
                            "property2": "val2"
                        },
                        baseType: "EventData",
                        baseData: {
                            "name": "Event Name"
                        }
                    };
                    var appInsightsEnvelope = Sender_1.Sender.constructEnvelope(inputEnvelope, _this._instrumentationKey, null);
                    var baseData = appInsightsEnvelope.data.baseData;
                    // Assert measurements
                    var resultMeasurements = baseData.measurements;
                    Assert.ok(resultMeasurements);
                    Assert.ok(resultMeasurements["measurement1"]);
                    Assert.equal(50.0, resultMeasurements["measurement1"]);
                    Assert.ok(resultMeasurements["measurement2"]);
                    Assert.equal(1.3, resultMeasurements["measurement2"]);
                    // Assert custom properties
                    Assert.ok(baseData.properties);
                    Assert.equal("val1", baseData.properties["property1"]);
                    Assert.equal("val2", baseData.properties["property2"]);
                    // Assert Event name
                    Assert.ok(baseData.name);
                    Assert.equal("Event Name", baseData.name);
                    // Assert ver
                    Assert.ok(baseData.ver);
                    Assert.equal(2, baseData.ver);
                    // Assert baseType
                    Assert.ok(appInsightsEnvelope.data.baseType);
                    Assert.equal("EventData", appInsightsEnvelope.data.baseType);
                    // Assert tags
                    Assert.ok(appInsightsEnvelope.tags);
                    // Assert.equal("d041d2e5fa834b4f9eee41ac163bf402", appInsightsEnvelope.tags["ai.session.id"]);
                    // Assert.equal("browser", appInsightsEnvelope.tags["ai.device.id"]);
                    // Assert.equal("Browser", appInsightsEnvelope.tags["ai.device.type"]);
                    // Assert.equal("javascript:1.0.18", appInsightsEnvelope.tags["ai.internal.sdkVersion"]);
                    // Assert name
                    Assert.ok(appInsightsEnvelope.name);
                    Assert.equal("Microsoft.ApplicationInsights.iKey.Event", appInsightsEnvelope.name);
                    // Assert iKey
                    Assert.ok(appInsightsEnvelope.iKey);
                    Assert.equal("iKey", appInsightsEnvelope.iKey);
                    // Assert timestamp
                    Assert.ok(appInsightsEnvelope.time);
                }
            });
            this.testCase({
                name: "AppInsightsTests: AppInsights Envelope  unknown type returns custom Event data type",
                test: function () {
                    var inputEnvelope = {
                        name: "test",
                        time: new Date("2018-06-12").toISOString(),
                        iKey: "iKey",
                        ext: {
                            "ai.session.id": "d041d2e5fa834b4f9eee41ac163bf402",
                            "ai.device.id": "browser",
                            "ai.device.type": "Browser",
                            "ai.internal.sdkVersion": "javascript:1.0.18",
                        },
                        tags: [{}],
                        data: {
                            "property1": "val1",
                            "measurement1": 50.0,
                            "measurement2": 1.3,
                            "property2": "val2"
                        },
                        baseType: "PageUnloadData",
                        baseData: {
                            id: "EADE2F09-DEBA-4B60-A222-E1D80BB8AA7F",
                            vpHeight: 1002,
                            vScrollOffset: 292
                        }
                    };
                    var appInsightsEnvelope = Sender_1.Sender.constructEnvelope(inputEnvelope, _this._instrumentationKey, null);
                    var baseData = appInsightsEnvelope.data.baseData;
                    // Assert measurements
                    var resultMeasurements = baseData.measurements;
                    Assert.ok(resultMeasurements);
                    Assert.ok(resultMeasurements["measurement1"]);
                    Assert.equal(50.0, resultMeasurements["measurement1"]);
                    Assert.ok(resultMeasurements["measurement2"]);
                    Assert.equal(1.3, resultMeasurements["measurement2"]);
                    Assert.ok(resultMeasurements["vpHeight"]);
                    Assert.equal(1002, resultMeasurements["vpHeight"]);
                    Assert.ok(resultMeasurements["vScrollOffset"]);
                    Assert.equal(292, resultMeasurements["vScrollOffset"]);
                    // Assert custom properties
                    Assert.ok(baseData.properties);
                    Assert.equal("val1", baseData.properties["property1"]);
                    Assert.equal("val2", baseData.properties["property2"]);
                    Assert.equal("EADE2F09-DEBA-4B60-A222-E1D80BB8AA7F", baseData.properties["id"]);
                    // Assert Event name
                    Assert.ok(baseData.name);
                    Assert.equal("PageUnloadData", baseData.name);
                    // Assert ver
                    Assert.ok(baseData.ver);
                    Assert.equal(2, baseData.ver);
                }
            });
            this.testCase({
                name: "AppInsightsTests: AppInsights Envelope create for Dependency Data",
                test: function () {
                    // setup
                    var inputEnvelope = {
                        name: "test",
                        time: new Date("2018-06-12").toISOString(),
                        iKey: "iKey",
                        ext: {
                            "user": {
                                "localId": "TestId",
                                "authId": "AuthenticatedId",
                                "id": "TestId"
                            }
                        },
                        tags: [{ "user.accountId": "TestAccountId" }],
                        baseType: "RemoteDependencyData",
                        baseData: {
                            id: 'some id',
                            name: "/test/name",
                            success: true,
                            responseCode: 200,
                            duration: 123,
                            type: 'Fetch',
                            data: 'some data',
                            target: 'https://example.com/test/name'
                        },
                        data: {
                            property1: "val1",
                            property2: "val2",
                            measurement1: 50.0,
                            measurement2: 1.3
                        }
                    };
                    // act
                    var appInsightsEnvelope = Sender_1.Sender.constructEnvelope(inputEnvelope, _this._instrumentationKey, null);
                    var baseData = appInsightsEnvelope.data.baseData;
                    // assert
                    var resultDuration = baseData.duration;
                    Assert.equal("00:00:00.123", resultDuration);
                    // Assert measurements
                    var resultMeasurements = baseData.measurements;
                    Assert.ok(resultMeasurements);
                    Assert.ok(resultMeasurements["measurement1"]);
                    Assert.equal(50.0, resultMeasurements["measurement1"]);
                    Assert.ok(resultMeasurements["measurement2"]);
                    Assert.equal(1.3, resultMeasurements["measurement2"]);
                    Assert.ok(!resultMeasurements.duration, "duration is not supposed to be treated as measurement");
                    // Assert custom properties
                    Assert.ok(baseData.properties);
                    Assert.equal("val1", baseData.properties["property1"]);
                    Assert.equal("val2", baseData.properties["property2"]);
                    // Assert baseData
                    Assert.ok(baseData.name);
                    Assert.equal("/test/name", baseData.data);
                    Assert.equal("some id", baseData.id);
                    Assert.equal(true, baseData.success);
                    Assert.equal(200, baseData.resultCode);
                    Assert.equal("GET /test/name", baseData.name);
                    Assert.equal("example.com", baseData.target);
                    // Assert ver
                    Assert.ok(baseData.ver);
                    Assert.equal(2, baseData.ver);
                    // Assert baseType
                    Assert.ok(appInsightsEnvelope.data.baseType);
                    Assert.equal("RemoteDependencyData", appInsightsEnvelope.data.baseType);
                    // Assert tags
                    Assert.ok(appInsightsEnvelope.tags);
                    Assert.equal("TestAccountId", appInsightsEnvelope.tags["ai.user.accountId"]);
                    Assert.equal("AuthenticatedId", appInsightsEnvelope.tags["ai.user.authUserId"]);
                    Assert.equal("TestId", appInsightsEnvelope.tags["ai.user.id"]);
                    // Assert name
                    Assert.ok(appInsightsEnvelope.name);
                    Assert.equal("Microsoft.ApplicationInsights.iKey.RemoteDependency", appInsightsEnvelope.name);
                    // Assert iKey
                    Assert.ok(appInsightsEnvelope.iKey);
                    Assert.equal("iKey", appInsightsEnvelope.iKey);
                    // Assert timestamp
                    Assert.ok(appInsightsEnvelope.time);
                }
            });
            this.testCase({
                name: "AppInsightsTests: AppInsights Envelope created for Page View",
                test: function () {
                    // setup
                    var inputEnvelope = {
                        name: "test",
                        time: new Date("2018-06-12").toISOString(),
                        iKey: "iKey",
                        ext: {
                            "user": {
                                "localId": "TestId",
                                "authId": "AuthenticatedId",
                                "id": "TestId"
                            },
                            "trace": {
                                "traceID": "1528B5FF-6455-4657-BE77-E6664CAC72DC",
                                "parentID": "1528B5FF-6455-4657-BE77-E6664CACEEEE"
                            }
                        },
                        tags: [{ "user.accountId": "TestAccountId" }],
                        baseType: "PageviewData",
                        baseData: {
                            "name": "Page View Name",
                            "uri": "https://fakeUri.com",
                            properties: {
                                "property1": "val1",
                                "property2": "val2"
                            },
                            measurements: {
                                "measurement1": 50.0,
                                "measurement2": 1.3,
                                "duration": 300000
                            }
                        }
                    };
                    // Act
                    var appInsightsEnvelope = Sender_1.Sender.constructEnvelope(inputEnvelope, _this._instrumentationKey, null);
                    var baseData = appInsightsEnvelope.data.baseData;
                    // Assert duration
                    var resultDuration = baseData.duration;
                    Assert.equal("00:05:00.000", resultDuration);
                    // Assert measurements
                    var resultMeasurements = baseData.measurements;
                    Assert.ok(resultMeasurements);
                    Assert.ok(resultMeasurements["measurement1"]);
                    Assert.equal(50.0, resultMeasurements["measurement1"]);
                    Assert.ok(resultMeasurements["measurement2"]);
                    Assert.equal(1.3, resultMeasurements["measurement2"]);
                    Assert.ok(!resultMeasurements.duration, "duration is not supposed to be treated as measurement");
                    // Assert custom properties
                    Assert.ok(baseData.properties);
                    Assert.equal("val1", baseData.properties["property1"]);
                    Assert.equal("val2", baseData.properties["property2"]);
                    // Assert Page View name
                    Assert.ok(baseData.name);
                    Assert.equal("Page View Name", baseData.name);
                    // Assert ver
                    Assert.ok(baseData.ver);
                    Assert.equal(2, baseData.ver);
                    // Assert baseType
                    Assert.ok(appInsightsEnvelope.data.baseType);
                    Assert.equal("PageviewData", appInsightsEnvelope.data.baseType);
                    // Assert tags
                    Assert.ok(appInsightsEnvelope.tags);
                    Assert.equal("TestAccountId", appInsightsEnvelope.tags["ai.user.accountId"]);
                    Assert.equal("AuthenticatedId", appInsightsEnvelope.tags["ai.user.authUserId"]);
                    Assert.equal("TestId", appInsightsEnvelope.tags["ai.user.id"]);
                    // Assert.equal("d041d2e5fa834b4f9eee41ac163bf402", appInsightsEnvelope.tags["ai.session.id"]);
                    // Assert.equal("browser", appInsightsEnvelope.tags["ai.device.id"]);
                    // Assert.equal("Browser", appInsightsEnvelope.tags["ai.device.type"]);
                    // Assert.equal("javascript:1.0.18", appInsightsEnvelope.tags["ai.internal.sdkVersion"]);
                    // Assert name
                    Assert.ok(appInsightsEnvelope.name);
                    Assert.equal("Microsoft.ApplicationInsights.iKey.Pageview", appInsightsEnvelope.name);
                    // Assert iKey
                    Assert.ok(appInsightsEnvelope.iKey);
                    Assert.equal("iKey", appInsightsEnvelope.iKey);
                    // Assert timestamp
                    Assert.ok(appInsightsEnvelope.time);
                    Assert.equal("1528B5FF-6455-4657-BE77-E6664CAC72DC", appInsightsEnvelope.tags["ai.operation.id"]);
                    Assert.equal("1528B5FF-6455-4657-BE77-E6664CACEEEE", appInsightsEnvelope.tags["ai.operation.parentId"]);
                }
            });
            this.testCase({
                name: 'Envelope: custom properties are put into envelope for Exception data type',
                test: function () {
                    var inputEnvelope = {
                        name: "test",
                        time: new Date("2018-06-12").toISOString(),
                        iKey: "iKey",
                        baseType: applicationinsights_common_5.Exception.dataType,
                        baseData: {
                            error: new Error(),
                            properties: {
                                "property1": "val1",
                                "property2": "val2"
                            },
                            measurements: {
                                "measurement1": 50.0,
                                "measurement2": 1.3
                            }
                        },
                        data: {
                            "property3": "val3",
                            "measurement3": 3.0
                        },
                        ext: {
                            "user": {
                                "localId": "TestId",
                                "authId": "AuthenticatedId",
                                "id": "TestId"
                            }
                        },
                        tags: [{ "user.accountId": "TestAccountId" }],
                    };
                    // Act
                    var appInsightsEnvelope = Sender_1.Sender.constructEnvelope(inputEnvelope, _this._instrumentationKey, null);
                    var baseData = appInsightsEnvelope.data.baseData;
                    Assert.equal(-1, JSON.stringify(baseData).indexOf("property3"), "ExceptionData: searching: customProperties (item.data) are not added to telemetry envelope");
                    Assert.equal("val1", baseData.properties["property1"], "ExceptionData: properties (item.baseData.properties) are added to telemetry envelope");
                    Assert.equal(50.0, baseData.measurements["measurement1"], "ExceptionData: measurements (item.baseData.measurements) are added to telemetry envelope");
                }
            });
            this.testCase({
                name: 'Offline watcher is listening to events',
                test: function () {
                    Assert.ok(Offline_2.Offline.isListening, 'Offline is listening');
                    Assert.equal(true, Offline_2.Offline.isOnline(), 'Offline reports online status');
                    Assert.equal(false, Offline_2.Offline.isOffline(), 'Offline reports offline status');
                }
            });
            this.testCase({
                name: 'Offline watcher responds to offline events (window.addEventListener)',
                test: function () {
                    // Setup
                    var offlineEvent = new Event('offline');
                    var onlineEvent = new Event('online');
                    // Verify precondition
                    Assert.ok(Offline_2.Offline.isListening);
                    Assert.ok(Offline_2.Offline.isOnline());
                    // Act - Go offline
                    window.dispatchEvent(offlineEvent);
                    _this.clock.tick(1);
                    // Verify offline
                    Assert.ok(Offline_2.Offline.isOffline());
                    // Act - Go online
                    window.dispatchEvent(onlineEvent);
                    _this.clock.tick(1);
                    // Verify online
                    Assert.ok(Offline_2.Offline.isOnline());
                }
            });
        };
        return SenderTests;
    }(TestClass));
    exports.SenderTests = SenderTests;
});
define("Tests/Selenium/aichannel.tests", ["require", "exports", "Tests/Sender.tests"], function (require, exports, Sender_tests_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function runTests() {
        new Sender_tests_1.SenderTests().registerTests();
    }
    exports.runTests = runTests;
});
//# sourceMappingURL=aichannel.tests.js.map