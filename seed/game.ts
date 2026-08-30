import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();
import { getPayload } from "payload";
import config from "../src/payload.config";
import SeedService from "./index";
// pnpm tsx  seed/game.ts
async function readCol() {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "media",
    depth: 0,
    limit: 1000,
    pagination: false,
  });
  console.log(JSON.stringify(res, null, 1));

  // const product = await payload.findByID({
  //   collection: "products",
  //   id: 29, // change to your id
  //   depth: 3,
  // });

  // console.log(JSON.stringify(product, null, 1));
}

async function main1() {
  const payload = await getPayload({ config });

  const variantsCollection = payload.collections["variants"]?.config;
  console.log(
    variantsCollection.fields.map((f: any) => ({
      name: f.name,
      type: f.type,
      relationTo: f.relationTo,
      subFields: Array.isArray(f.fields)
        ? f.fields.map((sf: any) => ({ name: sf.name, type: sf.type }))
        : undefined,
    })),
  );
}
async function main() {
  const payload = await getPayload({ config });

  const collectionsToInspect = ["variants", "variantOptions", "variantTypes"];

  for (const slug of collectionsToInspect) {
    const col = payload.collections[slug]?.config;
    if (!col) {
      console.log(`❌ Collection not found: ${slug}`);
      continue;
    }

    console.log(`\n============================`);
    console.log(`COLLECTION: ${slug}`);
    console.log(`============================`);

    for (const f of col.fields) {
      console.log({
        name: f.name,
        type: f.type,
        relationTo: f.relationTo,
      });

      if (Array.isArray((f as any).fields)) {
        console.log("  └─ GROUP FIELDS:");
        console.dir(
          (f as any).fields.map((sf: any) => ({
            name: sf.name,
            type: sf.type,
            relationTo: sf.relationTo,
          })),
          { depth: null },
        );
      }
    }
  }
}
const image_test = async () => {
  const seed = new SeedService();
  await seed.init();
  await seed.uploadMediaFromDisk("test.png");
};

readCol()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌  failed", err);
    process.exit(1);
  });
