/// <reference path="./TestFramework/Common.ts" />
import { Sender } from "../src/Sender";
import { Offline } from '../src/Offline';
import { Exception } from "@microsoft/applicationinsights-common";
import { ITelemetryItem, AppInsightsCore } from "@microsoft/applicationinsights-core-js";

export class SenderTests extends TestClass {
    private _sender: Sender;
    private _instrumentationKey = 'iKey';

    public testInitialize() {
        this._sender = new Sender();
        this._sender.initialize({ instrumentationKey: this._instrumentationKey }, new AppInsightsCore(), []);
    }

    public testCleanup() {
        this._sender = null;
    }

    public registerTests() {

        this.testCase({
            name: "Channel Config: Channel can properly take args from root config",
            test: () => {
                this._sender.initialize(
                    {
                        instrumentationKey: 'abc',
                        maxBatchInterval: 123,
                        endpointUrl: 'https://example.com',
                        maxBatchSizeInBytes: 654,
                        extensionConfig: {
                            [this._sender.identifier]: {
                                maxBatchSizeInBytes: 456
                            }
                        }

                    }, new AppInsightsCore(), []
                );

                Assert.equal(123, this._sender._config.maxBatchInterval(), 'Channel config can be set from root config (maxBatchInterval)');
                Assert.equal('https://example.com', this._sender._config.endpointUrl(), 'Channel config can be set from root config (endpointUrl)');
                Assert.notEqual(654, this._sender._config.maxBatchSizeInBytes(), 'Channel config does not equal root config option if extensionConfig field is also set');
                Assert.equal(456, this._sender._config.maxBatchSizeInBytes(), 'Channel config prioritizes extensionConfig over root config');
            }
        });

        this.testCase({
            name: "AppInsightsTests: AppInsights Envelope created for Custom Event",
            test: () => {
                let inputEnvelope: ITelemetryItem = {
                    name: "test",
                    time: new Date("2018-06-12").toISOString(),
                    ikey: "iKey",
                    ctx: {
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
                let appInsightsEnvelope = Sender.constructEnvelope(inputEnvelope, this._instrumentationKey, null);

                let baseData = appInsightsEnvelope.data.baseData;

                // Assert measurements
                let resultMeasurements = baseData.measurements;
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
            name: "AppInsightsTests: AppInsights Envelope created for Page View",
            test: () => {
                // setup
                let inputEnvelope: ITelemetryItem = {
                    name: "test",
                    time: new Date("2018-06-12").toISOString(),
                    ikey: "iKey",
                    ctx: {
                        "User": {
                            "localId": "TestId",
                            "authId": "AuthenticatedId",
                            "id": "TestId"
                        }
                    },
                    tags: [{"User": {"AccountId": "TestAccountId"} }],
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
                let appInsightsEnvelope = Sender.constructEnvelope(inputEnvelope, this._instrumentationKey, null);
                let baseData = appInsightsEnvelope.data.baseData;

                // Assert duration
                let resultDuration = baseData.duration;
                Assert.equal("00:05:00.000", resultDuration);

                // Assert measurements
                let resultMeasurements = baseData.measurements;
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
                Assert.ok("TestAccountId", appInsightsEnvelope.tags["ai.user.accountId"]);
                Assert.ok("AuthenticatedId", appInsightsEnvelope.tags["ai.user.authUserId"]);
                Assert.ok("TestId", appInsightsEnvelope.tags["ai.user.id"]);

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
            }
        });

        this.testCase({
            name: 'Envelope: custom properties are put into envelope',
            test: () => {
                const inputEnvelope: ITelemetryItem = {
                    name: "test",
                    time: new Date("2018-06-12").toISOString(),
                    ikey: "iKey",
                    baseType: Exception.dataType,
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
                    ctx: {
                        "User": {
                            "localId": "TestId",
                            "authId": "AuthenticatedId",
                            "id": "TestId"
                        }
                    },
                    tags: [{"User": {"AccountId": "TestAccountId"} }],
                };

                // Act
                let appInsightsEnvelope = Sender.constructEnvelope(inputEnvelope, this._instrumentationKey, null);
                let baseData = appInsightsEnvelope.data.baseData;

                Assert.equal(-1, JSON.stringify(baseData).indexOf("property3"), "ExceptionData: searching: customProperties (item.data) are not added to telemetry envelope")
                Assert.equal("val1", baseData.properties["property1"], "ExceptionData: properties (item.baseData.properties) are added to telemetry envelope");
                Assert.equal(50.0, baseData.measurements["measurement1"], "ExceptionData: measurements (item.baseData.measurements) are added to telemetry envelope");

            }
        });

        this.testCase({
            name: 'Offline watcher is listening to events',
            test: () => {
                Assert.ok(Offline.isListening, 'Offline is listening');
                Assert.equal(true, Offline.isOnline(), 'Offline reports online status');
                Assert.equal(false, Offline.isOffline(), 'Offline reports offline status');
            }
        });

        this.testCase({
            name: 'Offline watcher responds to offline events (window.addEventListener)',
            test: () => {
                // Setup
                const offlineEvent = new Event('offline');
                const onlineEvent = new Event('online');

                // Verify precondition
                Assert.ok(Offline.isListening);
                Assert.ok(Offline.isOnline());

                // Act - Go offline
                window.dispatchEvent(offlineEvent);
                this.clock.tick(1);

                // Verify offline
                Assert.ok(Offline.isOffline());

                // Act - Go online
                window.dispatchEvent(onlineEvent);
                this.clock.tick(1);

                // Verify online
                Assert.ok(Offline.isOnline());
            }
        });
    }
}
