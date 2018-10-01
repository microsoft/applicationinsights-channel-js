///<reference types="applicationinsights-core-js" />
import {
    IEnvelope, Data, Envelope,
    RemoteDependencyData, Event, Exception,
    Metric, PageView, Trace, PageViewPerformance
} from 'applicationinsights-common';
import { 
    ITelemetryItem, CoreUtils,
    IDiagnosticLogger, LoggingSeverity, _InternalMessageId
} from 'applicationinsights-core-js';
import { IDependencyTelemetry } from 'applicationinsights-common';

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
        envelope.iKey = telemetryItem.instrumentationKey;
        let iKeyNoDashes = telemetryItem.instrumentationKey.replace(/-/g, "");
        envelope.name = envelope.name.replace("{0}", iKeyNoDashes);

        // loop through the envelope ctx (Part A) and pick out the ones that should go in outgoing envelope tags
        for (let key in telemetryItem.ctx) {
            if (telemetryItem.ctx.hasOwnProperty(key)) {
                if (ContextTagKeys.indexOf(key) >= 0) {
                    envelope.tags[key] = telemetryItem.ctx[key];
                }
            }
        }

        // loop through the envelope tags (extension of Part A) and pick out the ones that should go in outgoing envelope tags
        telemetryItem.tags.forEach((tag) => {
            for (let key in tag) {
                if (tag.hasOwnProperty(key)) {
                    if (ContextTagKeys.indexOf(key) >= 0) {
                        envelope.tags[key] = tag[key];
                    }
                }
            }
        });

        return envelope;
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
        let absoluteUrl = bd.absoluteUrl;
        let command = bd.commandName;
        let duration = bd.duration;
        let success = bd.success;
        let resultCode = bd.resultCode;
        let method = bd.method;
        let baseData = new RemoteDependencyData(logger, id, absoluteUrl, command, duration, success, resultCode, method, customProperties, customMeasurements);
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
        if (telemetryItem.baseType !== Event.dataType) { // if its not a known type, its treated as custom event
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

        let customProperties = {};
        let customMeasurements = {};
        EnvelopeCreator.extractPropsAndMeasurements(telemetryItem.data, customProperties, customMeasurements);
        let exception = telemetryItem.baseData.error;
        let severityLevel = telemetryItem.baseData.severityLevel;
        let baseData = new Exception(logger, exception, customProperties, customMeasurements, severityLevel);
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
        if (!CoreUtils.isNullOrUndefined(telemetryItem.data) &&
            !CoreUtils.isNullOrUndefined(telemetryItem.data.duration)) {
            duration = telemetryItem.data.duration;
            delete telemetryItem.data.duration;
        }

        let customProperties = {};
        let customMeasurements = {};
        EnvelopeCreator.extractPropsAndMeasurements(telemetryItem.data, customProperties, customMeasurements);
        let name = telemetryItem.baseData.name;
        let url = telemetryItem.baseData.uri;
        // Todo: move IPageViewTelemetry to common as we are missing type checks on baseData here

        // refUri is a field that Breeze still does not recognize as part of Part B. For now, put it in Part C until it supports it as a domain property
        if (!CoreUtils.isNullOrUndefined(telemetryItem.baseData.refUri)) {
            customProperties["refUri"] = telemetryItem.baseData.refUri;
        }

        // pageType is a field that Breeze still does not recognize as part of Part B. For now, put it in Part C until it supports it as a domain property
        if (!CoreUtils.isNullOrUndefined(telemetryItem.baseData.pageType)) {
            customProperties["pageType"] = telemetryItem.baseData.pageType;
        }

        // isLoggedIn is a field that Breeze still does not recognize as part of Part B. For now, put it in Part C until it supports it as a domain property
        if (!CoreUtils.isNullOrUndefined(telemetryItem.baseData.isLoggedIn)) {
            customProperties["isLoggedIn"] = telemetryItem.baseData.isLoggedIn;
        }

        // pageTags is a field that Breeze still does not recognize as part of Part B. For now, put it in Part C until it supports it as a domain property
        if (!CoreUtils.isNullOrUndefined(telemetryItem.baseData.pageTags)) {
            let pageTags = telemetryItem.baseData.pageTags;
            for (let key in pageTags) {
                if (pageTags.hasOwnProperty(key)) {
                    customProperties[key] = pageTags[key];
                }
            }
        }

        let baseData = new PageView(logger, name, url, duration, customProperties, customMeasurements);
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

        let customProperties = {};
        let customMeasurements = {};
        EnvelopeCreator.extractPropsAndMeasurements(telemetryItem.data, customProperties, customMeasurements);
        let name = telemetryItem.baseData.name;
        let url = telemetryItem.baseData.uri;
        let duration = telemetryItem.baseData.duration;
        let baseData = new PageViewPerformance(logger, name, url, duration, customProperties, customMeasurements);
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
        let baseData = new Trace(logger, message, customProperties, severityLevel);
        let data = new Data<Trace>(Trace.dataType, baseData);
        return EnvelopeCreator.createEnvelope<Trace>(logger, Trace.envelopeType, telemetryItem, data);
    }
}