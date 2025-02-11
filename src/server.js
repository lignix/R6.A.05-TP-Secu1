import Fastify from "fastify"
import fastifyBasicAuth from "@fastify/basic-auth"
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const port = 3000;

async function createServer() {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    
    const key = fs.readFileSync(path.join(__dirname, '../server.key'))
    const cert = fs.readFileSync(path.join(__dirname, '../server.crt'))

    const fastify = Fastify({
        logger: true,
        https: {
            key,
            cert
        }
    });

    const authenticate = { realm: "Westeros" };

    fastify.register(fastifyBasicAuth, {
        validate,
        authenticate
    });

    async function validate(username, password, req, reply) {
        if (username !== "Tyrion" || password !== "wine") {
            return new Error("Winter is coming");
        }
    }

    fastify.get("/dmz", {}, (req, res) => {
        res.send({ replique: "Ca pourrait être mieux protégé..." });
    });

    fastify.after(() => {
        fastify.route({
            method: "GET",
            url: "/secu",
            onRequest: fastify.basicAuth,
            handler: async (req, reply) => {
                return { replique: "Un Lannister paye toujours ses dettes !" };
            }
        });

        fastify.route({
            method: "GET",
            url: "/autre",
            handler: async (req, reply) => {
                return { replique: "Je suis libre comme l'air !" };
            }
        });
    });

    fastify.setErrorHandler(function (err, req, reply) {
        if (err.statusCode === 401) {
            console.log(err);
            reply.code(401).send({ replique: "Tu ne sais rien, John Snow.." });
        }
        reply.send(err);
    });

    fastify.listen({ port }, function (err, address) {
        if (err) {
            fastify.log.error(err);
            process.exit(1);
        }
        fastify.log.info(`Fastify is listening on ${address}`);
    });
}

createServer();
