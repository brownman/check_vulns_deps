## todos

- fix tests

## regs

- show warnings:
- https://github.com/TypeStrong/ts-node/issues/465

```sh
node  --trace-warnings -r ts-node/register -r tsconfig-paths/register ./src/index.ts
node  --trace-warnings -r ts-node/register ./src/index.ts
```

# qa

- speed: await under for loop - vs - promise.all
