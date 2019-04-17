import {RouterRegistry} from "../../src";
import {DefaultExpressApplication} from "../../src/express";
import { expect } from 'chai';
import * as request from 'supertest';
import * as path from "path";
import 'mocha';

const TEST_PORT = 4444;

describe('test-controller with default config', () => {
    let server;
    let messageId;

    before(async () => {
        const componentScanPaths = [
            path.join(__dirname, "..", "fixtures", "services"),
            path.join(__dirname, "..", "fixtures", "controllers")
        ];
        server = await new DefaultExpressApplication(componentScanPaths).start(TEST_PORT);
    });

    it('should say hello', async () => {
        const result = await request(`http://localhost:${TEST_PORT}`).get('/echo/cnorris');
        expect(result.statusCode).to.eq(200);
        expect(result.text).to.eq('{"response":{"heading":"test","message":{"text":"cnorris"}}}');
    });

    it('fails with status code', async () => {
        const result = await request(`http://localhost:${TEST_PORT}`).get('/fail/with/400');
        expect(result.statusCode).to.eq(400);
        expect(JSON.parse(result.text)).to.eq('Request failed');
    });

    it('handles post correctly', async () => {
        const result = await request(`http://localhost:${TEST_PORT}`).post('/api/messages').send({message: 'test message'});
        expect(result.statusCode).to.eq(200);
        const res = JSON.parse(result.text);
        expect(res.id).not.to.be.empty;
        expect(res.message).not.to.be.empty;
        messageId = res.id;
    });

    it('handles get correctly', async () => {
        const result = await request(`http://localhost:${TEST_PORT}`).get(`/api/messages/${messageId}`);
        expect(result.statusCode).to.eq(200);
        const res = JSON.parse(result.text);
        expect(res.id).to.eq(messageId);
        expect(res.message).to.eq('test message');
    });

    it('handles put correctly', async () => {
        const messages = [
            {id: "111", message: "test message 111"},
            {id: "222", message: "test message 222"}
        ];
        const result = await request(`http://localhost:${TEST_PORT}`).put(`/api/messages`).send(messages);
        expect(result.statusCode).to.eq(200);
        const res = JSON.parse(result.text);
        expect(res[0].id).to.eq("111");
        expect(res[1].id).to.eq("222");
        expect(res[0].message).to.eq('test message 111');
        expect(res[1].message).to.eq('test message 222');
    });

    it('handles delete correctly', async () => {
        const result = await request(`http://localhost:${TEST_PORT}`).delete(`/api/messages/111`);
        expect(result.statusCode).to.eq(200);
        const res = JSON.parse(result.text);
        expect(res.id).to.eq("111");
        expect(res.message).to.eq('test message 111');
    });


    after(() => {
        RouterRegistry.getInstance().clear();
        server.close();
    })
});
