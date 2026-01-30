import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";
export const appRouter = createTRPCRouter({
  getWorkflows: protectedProcedure.query(({ ctx }) => {
    return prisma.workflow.findMany();
  }),
   test: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: "execute/ai",
    })
    return true;
  }),
  createWorkflow: protectedProcedure.mutation(()=>{
    return prisma.workflow.create({
      data:{
        name:"New Workflow"
      }
    });
  })
});
// export type definition of API
export type AppRouter = typeof appRouter;
