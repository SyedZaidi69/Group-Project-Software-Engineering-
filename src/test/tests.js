import express from "express";
import Prisma from "@prisma/client";
const { PrismaClient } = Prisma;

export const functions = {
    isExpressDefined: function () {
        return express();
    },
    isPrismaDefined: function () {
        return new PrismaClient();
    }
}