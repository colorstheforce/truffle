/**
 * @category Internal processor
 * @packageDocumentation
 */
import { logger } from "@truffle/db/logger";
const debug = logger("db:project:loadMigrate:contracts");

import gql from "graphql-tag";
import type { IdObject } from "@truffle/db/resources";
import { resources } from "@truffle/db/process";
import * as Batch from "./batch";

export const process = Batch.configure<{
  artifact: {
    db: {
      contract: IdObject<"contracts">;
      callBytecode: IdObject<"bytecodes">;
      createBytecode: IdObject<"bytecodes">;
    };
  };
  produces: {
    callBytecode?: {
      linkReferences: { name: string }[];
    };
    createBytecode?: {
      linkReferences: { name: string }[];
    };
  };
  entry: IdObject<"contracts">;
  result: {
    callBytecode?: {
      linkReferences: { name: string }[];
    };
    createBytecode?: {
      linkReferences: { name: string }[];
    };
  };
}>({
  extract({ inputs: { artifacts }, breadcrumb: { artifactIndex } }) {
    return artifacts[artifactIndex].db.contract;
  },

  *process({ entries }) {
    return yield* resources.find(
      "contracts",
      entries.map(({ id }) => id),
      gql`
        fragment Bytecode on Bytecode {
          linkReferences {
            name
          }
        }

        fragment ContractBytecodes on Contract {
          callBytecode {
            ...Bytecode
          }
          createBytecode {
            ...Bytecode
          }
        }
      `
    );
  },

  convert<_I, _O>({ result, input }) {
    return {
      ...input,
      ...result
    };
  }
});
