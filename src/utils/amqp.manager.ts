import * as amqp from "amqplib";
import { Channel, Connection, Message } from "amqplib";
import { configureLogger, defaultWinstonLoggerOptions, getLogger } from "./logger";

export interface IConfigAmqp {
    url: string;
    port: number;
    user: string;
    password: string;
    options: any;
}

configureLogger("amqpManager", defaultWinstonLoggerOptions);


export class AmqpManager {
    connection: Connection;
    channel: Channel;
    connected: boolean;
    configRabbit: any;
    queueName: string;

    constructor(config: IConfigAmqp) {
        getLogger("amqpManager").log("info", "Initializing Rabbitmq connection");
        this.configRabbit = config;
        this.connect();
    }

    private connect(callback?: () => void): void {
        this.connected = false;
        const uri =
            `amqp://${this.configRabbit.user}:${this.configRabbit.password}` +
            `@${this.configRabbit.url}:${this.configRabbit.port}`;
        getLogger("amqpManager").log("info", "Trying to connect to Rabbitmq");
        amqp.connect(uri)
            .then(connection => {
                this.connection = connection;
                getLogger("amqpManager").log("info", "Successfully connected to Rabbitmq " + this.configRabbit.url);
                this.connected = true;
                this.restartOnFail();
                this.createChannel(callback);
            })
            .catch(err => {
                getLogger("amqpManager").log("error", err.message);
                this.connected = false;
                setTimeout(() => this.connect(callback), this.configRabbit.options.reconnectTime);
            });
    }

    private restartOnFail(): void {
        if (!this.connection) {
            getLogger("amqpManager").log("error", "Can not instantiate restart on fail");
            return;
        }
        this.connection.on("error", (err: Error) => {
            getLogger("amqpManager").log("error", err.message);
            this.connected = false;
        });
        this.connection.on("close", () => {
            getLogger("amqpManager").log("error", "AmqpConsumer : Reconnecting...");
            this.connect();
        });
    }

    private createChannel(callback?: () => void): void {
        if (this.connection) {
            this.connection.createChannel().then(async channel => {
                this.channel = channel;
                getLogger("amqpManager").log("info", "Create exchange", this.configRabbit.options.queueName);
                return channel.assertExchange(this.configRabbit.options.exchangeName, this.configRabbit.options.exchangeType);
            })
                .then(() => {
                    return this.channel.assertQueue(this.configRabbit.options.queueName, {
                        exclusive: true
                    });
                })
                .then(queue => {
                    this.queueName = queue.queue;
                    return this.channel.consume(this.queueName, this.consumeMessage.bind(this), {
                        noAck: this.configRabbit.noAck
                    });
                })
                .then(() => {
                    return this.channel.bindQueue(this.queueName, this.configRabbit.options.exchangeName, '');
                })
                .then(() => {
                    getLogger("amqpManager").log("info", "Ready to consume message");
                    if (typeof callback === "function") {
                        callback();
                    }
                })
                .catch(err => {
                    getLogger("amqpManager").log("error", err.message);
                });
        } else {
            this.connect(callback);
        }
    }

    private async consumeMessage(msg: Message) {
        try {
            getLogger('amqpManager').log('info','New message');
            const notification: any = JSON.parse(msg.content.toString()); // check error
            console.log(notification);
        } catch (err) {
            getLogger('amqpManager').log('error',err.message);
        }
    }
}
