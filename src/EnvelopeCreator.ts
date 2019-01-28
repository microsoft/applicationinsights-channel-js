import {
    IEnvelope, Data, Envelope, SampleRate,
    RemoteDependencyData, Event, Exception,
    Metric, PageView, Trace, PageViewPerformance, IDependencyTelemetry,
    IPageViewPerformanceTelemetry, IPageViewTelemetry, CtxTagKeys,
    UnmappedKeys, AppExtensionKeys, DeviceExtensionKeys,
    IngestExtKeys, WebExtensionKeys, OSExtKeys, HttpMethod, UserExtensionKeys
} from '@microsoft/applicationinsights-common';
import {
    ITelemetryItem, CoreUtils,
    IDiagnosticLogger, LoggingSeverity, _InternalMessageId
} from '@microsoft/applicationinsights-core-js';

export const ContextTagKeys: string[] = [
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
const baseType: string = "baseType";
const baseData: string = "baseData";

export abstract class EnvelopeCreator {
    protected _logger: IDiagnosticLogger;

    abstract Create(logger: IDiagnosticLogger, telemetryItem: ITelemetryItem): IEnvelope;

    protected static extractProperties(data: { [key: string]: any }): { [key: string]: any } {
        let customProperties: { [key: string]: any } = null;
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                let value = data[key];
                if (typeof value !== "number") {
                    if (!customProperties) {
                        customProperties = {};
                    }
                    customProperties[key] = value;
                }
            }
        }

        return customProperties;
    }

    protected static extractPropsAndMeasurements(data: { [key: string]: any }, properties: { [key: string]: any }, measurements: { [key: string]: any }) {
        if (!CoreUtils.isNullOrUndefined(data)) {
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    let value = data[key];
                    if (typeof value === "number") {
                        measurements[key] = value;
                    } else {
                        properties[key] = value;
                    }
                }
            }
        }
    }

    // TODO: Do we want this to take logger as arg or use this._logger as nonstatic?
    protected static createEnvelope<T>(logger: IDiagnosticLogger, envelopeType: string, telemetryItem: ITelemetryItem, data: Data<T>): IEnvelope {
        let envelope = new Envelope(logger, data, envelopeType);
        envelope.iKey = telemetryItem.iKey;
        let iKeyNoDashes = telemetryItem.iKey.replace(/-/g, "");
        envelope.name = envelope.name.replace("{0}", iKeyNoDashes);

        // extract all extensions from ctx
        EnvelopeCreator.extractPartAExtensions(telemetryItem, envelope);

        // loop through the envelope tags (extension of Part A) and pick out the ones that should go in outgoing envelope tags
        if (!telemetryItem.tags) {
            telemetryItem.tags = [];
        }

        return envelope;
    }

    /*
     * Maps Part A data from CS 4.0
     */
    private static extractPartAExtensions(item: ITelemetryItem, env: IEnvelope) {
        let keysFound = [];
        let tagKeysfound = [];
        if (!env.tags) {
            env.tags = [];
        }

        if (!item.ctx) {
            item.ctx = {};
        }

        if (!item.tags) {
            item.tags = [];
        }

        if (item.tags[UnmappedKeys.applicationVersion]) {
            env.tags[CtxTagKeys.applicationVersion] = item.tags[UnmappedKeys.applicationVersion];
            tagKeysfound.push(UnmappedKeys.applicationVersion);
        }

        if (item.tags[UnmappedKeys.applicationBuild]) {
            env.tags[CtxTagKeys.applicationBuild] = item.tags[UnmappedKeys.applicationBuild];
            tagKeysfound.push(UnmappedKeys.applicationBuild);
        }

        if (item.ctx[UserExtensionKeys.authId]) {
            env.tags[CtxTagKeys.userAuthUserId] = item.ctx[UserExtensionKeys.authId];
            tagKeysfound.push(UserExtensionKeys.authId);
        }

        if (item.ctx[UserExtensionKeys.localId]) {
            env.tags[CtxTagKeys.userId] = item.ctx[UserExtensionKeys.localId];
            tagKeysfound.push(UserExtensionKeys.localId);
        }

        if (item.ctx[AppExtensionKeys.sessionId]) {
            env.tags[CtxTagKeys.sessionId] = item.ctx[AppExtensionKeys.sessionId];
            keysFound.push(AppExtensionKeys.sessionId);
        }

        if (item.tags[CtxTagKeys.sessionIsFirst]) {
            env.tags[CtxTagKeys.sessionIsFirst] = item.tags[CtxTagKeys.sessionIsFirst];
            tagKeysfound.push(CtxTagKeys.sessionIsFirst);
        }

        if (item.ctx[DeviceExtensionKeys.localId]) {
            env.tags[CtxTagKeys.deviceId] = item.ctx[DeviceExtensionKeys.localId];
            keysFound.push(DeviceExtensionKeys.localId);
        }

        if (item.ctx[IngestExtKeys.clientIp]) {
            env.tags[CtxTagKeys.deviceIp] = item.ctx[IngestExtKeys.clientIp];
            tagKeysfound.push(IngestExtKeys.clientIp);
        }

        if (item.ctx[WebExtensionKeys.browserLang]) {
            env.tags[CtxTagKeys.deviceLanguage] = item.ctx[WebExtensionKeys.browserLang];
            keysFound.push(WebExtensionKeys.browserLang);
        }

        if (item.tags[UnmappedKeys.deviceLocale]) {
            env.tags[CtxTagKeys.deviceLocale] = item.tags[UnmappedKeys.deviceLocale];
            tagKeysfound.push(UnmappedKeys.deviceLocale);
        }

        if (item.ctx[DeviceExtensionKeys.model] ) {
            env.tags[CtxTagKeys.deviceModel] = item.ctx[DeviceExtensionKeys.model];
            keysFound.push(DeviceExtensionKeys.model);
        }

        if (item.ctx[UnmappedKeys.deviceNetwork]) {
            env.tags[CtxTagKeys.deviceNetwork] = item.ctx[UnmappedKeys.deviceNetwork];
            keysFound.push(UnmappedKeys.deviceNetwork);
        }

        if (item.ctx[UnmappedKeys.deviceOEMName]) {
            env.tags[CtxTagKeys.deviceOEMName] = item.ctx[UnmappedKeys.deviceOEMName];
            keysFound.push(UnmappedKeys.deviceOSVersion);
        }

        if (item.tags[UnmappedKeys.deviceOSVersion]) {
            env.tags[CtxTagKeys.deviceOSVersion] = item.tags[UnmappedKeys.deviceOSVersion];
            tagKeysfound.push(UnmappedKeys.deviceOSVersion);
        }

        if (item.ctx[OSExtKeys.deviceOS]) {
            env.tags[CtxTagKeys.deviceOS] = item.ctx[OSExtKeys.deviceOS];
            keysFound.push(OSExtKeys.deviceOS);
        }

        if (item.ctx[UnmappedKeys.deviceNetwork]) {
            env.tags[CtxTagKeys.deviceNetwork] = item.ctx[UnmappedKeys.deviceNetwork];
            keysFound.push(UnmappedKeys.deviceNetwork);
        }

        if (item.ctx[DeviceExtensionKeys.deviceType]) {
            env.tags[CtxTagKeys.deviceType] = item.ctx[DeviceExtensionKeys.deviceType];
            keysFound.push(DeviceExtensionKeys.deviceType);
        }

        if (item.tags[UnmappedKeys.deviceOSVersion]) {
            env.tags[CtxTagKeys.deviceOSVersion] = item.tags[UnmappedKeys.deviceOSVersion];
            tagKeysfound.push(UnmappedKeys.deviceOSVersion);
        }

        if (item.tags[WebExtensionKeys.screenRes]) {
            env.tags[CtxTagKeys.deviceScreenResolution] = item.tags[WebExtensionKeys.screenRes];
            tagKeysfound.push(WebExtensionKeys.screenRes);
        }

        if (item.tags[SampleRate]) {
            env.tags.sampleRate = item.tags[SampleRate];
            tagKeysfound.push(SampleRate);
        }

        if (item.tags[CtxTagKeys.locationIp]) {
            env.tags[CtxTagKeys.locationIp] = item.tags[CtxTagKeys.locationIp];
            tagKeysfound.push(CtxTagKeys.locationIp);
        }

        if (item.tags[CtxTagKeys.internalSdkVersion]) {
            env.tags[CtxTagKeys.internalSdkVersion] = item.tags[CtxTagKeys.internalSdkVersion];
            tagKeysfound.push(CtxTagKeys.internalSdkVersion);
        }

        if (item.tags[CtxTagKeys.internalAgentVersion]) {
            env.tags[CtxTagKeys.internalAgentVersion] = item.tags[CtxTagKeys.internalAgentVersion];
            tagKeysfound.push(CtxTagKeys.internalAgentVersion);
        }

        if (item.tags[CtxTagKeys.operationRootId]) {
            env.tags[CtxTagKeys.operationRootId] = item.tags[CtxTagKeys.operationRootId];
            tagKeysfound.push(CtxTagKeys.operationRootId);
        }

        if (item.tags[CtxTagKeys.operationSyntheticSource]) {
            env.tags[CtxTagKeys.operationSyntheticSource] =  item.tags[CtxTagKeys.operationSyntheticSource];
            tagKeysfound.push(CtxTagKeys.operationSyntheticSource);
        }

        if (item.tags[CtxTagKeys.operationParentId]) {
            env.tags[CtxTagKeys.operationParentId] = item.tags[CtxTagKeys.operationParentId];
            tagKeysfound.push(CtxTagKeys.operationParentId);
        }

        if (item.tags[CtxTagKeys.operationName]) {
            env.tags[CtxTagKeys.operationName] = item.tags[CtxTagKeys.operationName];
            tagKeysfound.push(CtxTagKeys.operationName);
        }

        if (item.tags[CtxTagKeys.operationId]) {
            env.tags[CtxTagKeys.operationId] = item.tags[CtxTagKeys.operationId];
            tagKeysfound.push(CtxTagKeys.operationId);
        }

        item.tags.forEach(tag => {
            for (let key in tag) {
                if (tag.hasOwnProperty(key)) {
                    if (tagKeysfound.indexOf(tag) < 0) {
                        if (ContextTagKeys.indexOf(key) >= 0) {
                                env.tags[key] = tag[key];
                            }
                        }
                    }
                }
        });
    }
}

export class DependencyEnvelopeCreator extends EnvelopeCreator {
    static DependencyEnvelopeCreator = new DependencyEnvelopeCreator();

    Create(logger: IDiagnosticLogger, telemetryItem: ITelemetryItem): IEnvelope {
        this._logger = logger;
        if (CoreUtils.isNullOrUndefined(telemetryItem.baseData)) {
            this._logger.throwInternal(
                LoggingSeverity.CRITICAL,
                _InternalMessageId.TelemetryEnvelopeInvalid, "telemetryItem.baseData cannot be null.");
        }

        let customMeasurements = {};
        let customProperties = {};
        EnvelopeCreator.extractPropsAndMeasurements(telemetryItem.data, customProperties, customMeasurements);
        let bd = telemetryItem.baseData as IDependencyTelemetry;
        if (CoreUtils.isNullOrUndefined(bd)) {
            logger.warnToConsole("Invalid input for dependency data");
            return null;
        }

        let id = bd.id;
        let absoluteUrl = bd.target;
        let command = bd.name;
        let duration = bd.duration;
        let success = bd.success;
        let resultCode = bd.responseCode;
        let requestAPI = bd.type;
        let method = bd.properties && bd.properties[HttpMethod] ? bd.properties[HttpMethod] : "GET";
        let baseData = new RemoteDependencyData(logger, id, absoluteUrl, command, duration, success, resultCode, method, requestAPI, customProperties, customMeasurements);
        let data = new Data<RemoteDependencyData>(RemoteDependencyData.dataType, baseData);
        return EnvelopeCreator.createEnvelope<RemoteDependencyData>(logger, RemoteDependencyData.envelopeType, telemetryItem, data);
    }
}

export class EventEnvelopeCreator extends EnvelopeCreator {
    static EventEnvelopeCreator = new EventEnvelopeCreator();

    Create(logger: IDiagnosticLogger, telemetryItem: ITelemetryItem): IEnvelope {
        this._logger = logger;
        if (CoreUtils.isNullOrUndefined(telemetryItem.baseData)) {
            this._logger.throwInternal(
                LoggingSeverity.CRITICAL,
                _InternalMessageId.TelemetryEnvelopeInvalid, "telemetryItem.baseData cannot be null.");
        }

        let customProperties = {};
        let customMeasurements = {};
        if (telemetryItem.baseType === Event.dataType) { // take collection
            customProperties = telemetryItem.baseData.properties || {};
            customMeasurements = telemetryItem.baseData.measurements || {};
        } else { // if its not a known type, its treated as custom event
            EnvelopeCreator.extractPropsAndMeasurements(telemetryItem.baseData, customProperties, customMeasurements);
        }

        EnvelopeCreator.extractPropsAndMeasurements(telemetryItem.data, customProperties, customMeasurements);
        let eventName = telemetryItem.baseData.name;
        let baseData = new Event(logger, eventName, customProperties, customMeasurements);
        let data = new Data<Event>(Event.dataType, baseData);
        return EnvelopeCreator.createEnvelope<Event>(logger, Event.envelopeType, telemetryItem, data);
    }
}

export class ExceptionEnvelopeCreator extends EnvelopeCreator {
    static ExceptionEnvelopeCreator = new ExceptionEnvelopeCreator();

    Create(logger: IDiagnosticLogger, telemetryItem: ITelemetryItem): IEnvelope {
        this._logger = logger;
        if (CoreUtils.isNullOrUndefined(telemetryItem.baseData)) {
            this._logger.throwInternal(
                LoggingSeverity.CRITICAL,
                _InternalMessageId.TelemetryEnvelopeInvalid, "telemetryItem.baseData cannot be null.");
        }

        let properties = telemetryItem.baseData.properties;
        let measurements = telemetryItem.baseData.measurements;
        let exception = telemetryItem.baseData.error;
        let severityLevel = telemetryItem.baseData.severityLevel;
        let baseData = new Exception(logger, exception, properties, measurements, severityLevel);
        let data = new Data<Exception>(Exception.dataType, baseData);
        return EnvelopeCreator.createEnvelope<Exception>(logger, Exception.envelopeType, telemetryItem, data);
    }
}

export class MetricEnvelopeCreator extends EnvelopeCreator {
    static MetricEnvelopeCreator = new MetricEnvelopeCreator();

    Create(logger: IDiagnosticLogger, telemetryItem: ITelemetryItem): IEnvelope {
        this._logger = logger;
        if (CoreUtils.isNullOrUndefined(telemetryItem.baseData)) {
            this._logger.throwInternal(
                LoggingSeverity.CRITICAL,
                _InternalMessageId.TelemetryEnvelopeInvalid, "telemetryItem.baseData cannot be null.");
        }

        let customProperties = EnvelopeCreator.extractProperties(telemetryItem.data);
        let name = telemetryItem.baseData.name;
        let average = telemetryItem.baseData.average;
        let sampleCount = telemetryItem.baseData.sampleCount;
        let min = telemetryItem.baseData.min;
        let max = telemetryItem.baseData.max;
        let baseData = new Metric(logger, name, average, sampleCount, min, max, customProperties);
        let data = new Data<Metric>(Metric.dataType, baseData);
        return EnvelopeCreator.createEnvelope<Metric>(logger, Metric.envelopeType, telemetryItem, data);
    }
}

export class PageViewEnvelopeCreator extends EnvelopeCreator {
    static PageViewEnvelopeCreator = new PageViewEnvelopeCreator();

    Create(logger: IDiagnosticLogger, telemetryItem: ITelemetryItem): IEnvelope {
        this._logger = logger;
        if (CoreUtils.isNullOrUndefined(telemetryItem.baseData)) {
            this._logger.throwInternal(
                LoggingSeverity.CRITICAL,
                _InternalMessageId.TelemetryEnvelopeInvalid, "telemetryItem.baseData cannot be null.");
        }

        // Since duration is not part of the domain properties in Common Schema, extract it from part C
        let duration = undefined;
        if (!CoreUtils.isNullOrUndefined(telemetryItem.baseData) &&
            !CoreUtils.isNullOrUndefined(telemetryItem.baseData.measurements)) {
            duration = telemetryItem.baseData.measurements.duration;
            delete telemetryItem.baseData.measurements.duration;
        }

        let bd = telemetryItem.baseData as IPageViewTelemetry;
        let name = bd.name;
        let url = bd.uri;
        let properties = bd.properties || {};
        let measurements = bd.measurements || {};

        // refUri is a field that Breeze still does not recognize as part of Part B. For now, put it in Part C until it supports it as a domain property
        if (!CoreUtils.isNullOrUndefined(bd.refUri)) {
            properties["refUri"] = bd.refUri;
        }

        // pageType is a field that Breeze still does not recognize as part of Part B. For now, put it in Part C until it supports it as a domain property
        if (!CoreUtils.isNullOrUndefined(bd.pageType)) {
            properties["pageType"] = bd.pageType;
        }

        // isLoggedIn is a field that Breeze still does not recognize as part of Part B. For now, put it in Part C until it supports it as a domain property
        if (!CoreUtils.isNullOrUndefined(bd.isLoggedIn)) {
            properties["isLoggedIn"] = bd.isLoggedIn.toString();
        }

        // pageTags is a field that Breeze still does not recognize as part of Part B. For now, put it in Part C until it supports it as a domain property
        if (!CoreUtils.isNullOrUndefined(bd.properties)) {
            let pageTags = bd.properties;
            for (let key in pageTags) {
                if (pageTags.hasOwnProperty(key)) {
                    properties[key] = pageTags[key];
                }
            }
        }

        let baseData = new PageView(logger, name, url, duration, properties, measurements);
        let data = new Data<PageView>(PageView.dataType, baseData);
        return EnvelopeCreator.createEnvelope<PageView>(logger, PageView.envelopeType, telemetryItem, data);
    }
}

export class PageViewPerformanceEnvelopeCreator extends EnvelopeCreator {
    static PageViewPerformanceEnvelopeCreator = new PageViewPerformanceEnvelopeCreator();

    Create(logger: IDiagnosticLogger, telemetryItem: ITelemetryItem): IEnvelope {
        this._logger = logger;
        if (CoreUtils.isNullOrUndefined(telemetryItem.baseData)) {
            this._logger.throwInternal(
                LoggingSeverity.CRITICAL,
                _InternalMessageId.TelemetryEnvelopeInvalid, "telemetryItem.baseData cannot be null.");
        }

        const bd = telemetryItem.baseData as IPageViewPerformanceTelemetry;
        let name = bd.name;
        let url = bd.url;
        let properties = bd.properties;
        let measurements = bd.measurements;
        let baseData = new PageViewPerformance(logger, name, url, undefined, properties, measurements);
        let data = new Data<PageViewPerformance>(PageViewPerformance.dataType, baseData);
        return EnvelopeCreator.createEnvelope<PageViewPerformance>(logger, PageViewPerformance.envelopeType, telemetryItem, data);
    }
}

export class TraceEnvelopeCreator extends EnvelopeCreator {
    static TraceEnvelopeCreator = new TraceEnvelopeCreator();

    Create(logger: IDiagnosticLogger, telemetryItem: ITelemetryItem): IEnvelope {
        this._logger = logger;
        if (CoreUtils.isNullOrUndefined(telemetryItem.baseData)) {
            this._logger.throwInternal(
                LoggingSeverity.CRITICAL,
                _InternalMessageId.TelemetryEnvelopeInvalid, "telemetryItem.baseData cannot be null.");
        }

        let message = telemetryItem.baseData.message;
        let severityLevel = telemetryItem.baseData.severityLevel;
        let customProperties = EnvelopeCreator.extractProperties(telemetryItem.data);
        let baseData = new Trace(logger, message, severityLevel, customProperties);
        let data = new Data<Trace>(Trace.dataType, baseData);
        return EnvelopeCreator.createEnvelope<Trace>(logger, Trace.envelopeType, telemetryItem, data);
    }
}
