# Rosewood

Personal fork of [T3 Code](https://github.com/pingdotgg/t3code) by T3 Tools Inc., used under the MIT license.

Not affiliated with or endorsed by T3 Tools Inc. Fork tooling and the upstream sync process are documented in [rosewood/README.md](./rosewood/README.md).

## Run from source

```bash
vp i
vp run dev
```

State lives in `~/.rosewood`, separate from any T3 Code install. Telemetry is off by default.

## Desktop build

The Linux desktop build needs libsecret headers (`libsecret-devel` on Fedora, `libsecret-1-dev` on Debian). On Fedora it also needs `libxcrypt-compat`, because the `.deb` step's bundled `fpm` loads `libcrypt.so.1`.

```bash
vp run dist:desktop:linux
```
