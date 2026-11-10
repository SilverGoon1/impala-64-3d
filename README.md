# 1964 Chevrolet Impala Convertible — 3D Systems Explorer

Interactive, procedurally generated (Three.js) 1964 Impala convertible built from published factory dimensions
(119.0 in wheelbase, 209.9 in length, 78.1 in width, 55.8 in height, 60.3/59.3 in track, 7.50-14 tires).

- Six major systems: body, X-frame chassis, engine & drivetrain, suspension/steering/brakes, interior, convertible top
- Click a system to extract it (animated lift + highlight), read sourced specs, see numbered connection points, and concept notes
- Explode-all slider with live 3D connection lines between systems
- 360° orbit / zoom / pan (mouse + touch), PBR clearcoat paint in 15 factory 1964 colours, all 7 factory engine choices
- Sources & approximations listed in-app

```bash
npm install
npm run dev    # local
npm run build  # production build to dist/
```

URL params (handy for screenshots): `?explode=1`, `?select=engine`, `?engine=L80`, `?paint=936`, `?top=down`.
