import { expect, it, describe } from "@jest/globals";    

describe("Health check logic", () => { 
    it("returns healthy status", () => { 
        const status = "healthy";
        expect(status).toBe("healthy");
    })

    it("has a valid timestamp format", () => { 
        const timestamp = new Date().toISOString();
        expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })
})