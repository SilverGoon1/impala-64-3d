// Real 1964 Chevrolet Impala convertible data. Every number is tied to a source id (see SOURCES).
// Values marked approx:true are derived/estimated for the procedural model, not factory-published.

export const SOURCES = [
  { id: 'carfolio', title: 'Carfolio – 1964 Chevrolet Impala Convertible (1700-1800) specifications', url: 'https://www.carfolio.com/chevrolet-impala-convertible-410465' },
  { id: 'ama', title: 'AMA Specifications – 1964 Chevrolet passenger car (327 & 409 V8), issued 09-23-63', url: 'https://over-drive-magazine.com/wp-content/uploads/Chevrolet/1964/1964-CHEVROLET-327-and-409_V8-Specs.pdf' },
  { id: 'mt', title: 'Motor Trend, May 1964 – Chevrolet Impala road test (manufacturer specifications)', url: 'https://over-drive-magazine.com/wp-content/uploads/2022/10/1964-05-MT-Chevrolet-Impala-Test-1-6.pdf' },
  { id: 'hemmings', title: 'Hemmings – 1964 Chevrolet Impala SS (chassis, suspension, engine codes)', url: 'https://www.hemmings.com/stories/1964-chevrolet-impala-ss/' },
  { id: 'hemmings2', title: 'Hemmings – Sensational Sport Sedan: 1964 Impala (transmission pairings)', url: 'https://www.hemmings.com/stories/sensational-sport-sedan-1964-chevrolet-impala/' },
  { id: 'ci', title: 'Classic Industries – 1958-64 Impala models & mechanical specifications', url: 'https://news.classicindustries.com/1958-1969-impala-models-specifications' },
  { id: 'colors', title: 'American Car Classics – Impala colors & paint codes (GM Heritage list)', url: 'https://americancarclassics.com/chevrolet/impala/colors/' },
  { id: 'paintchart', title: 'Unique Cars & Parts – 1964 GM paint chart & codes', url: 'https://www.uniquecarsandparts.net.au/colour_swatch_gm_1964' },
  { id: 'shafers', title: "Shafer's Classic – Convertible Top Assembly, 1962-1964 full-size Chevrolet (TechHelp)", url: 'https://shafersclassic.com/file/6644-CBK400.pdf' },
  { id: 'toptech', title: 'Convertible Top Guys – 1961-64 Impala tops & hydraulics', url: 'https://www.convertibletopguys.com/convertible/660/1961-64-Chevrolet-Impala-Impala-SS' },
  { id: 'overview', title: '1964 Chevrolet Impala model overview PDF (SS interior, trim, top colours)', url: 'https://assets.ctfassets.net/x8mrk904j4k6/64QRcScu6gL4Uo3oia9ZPp/23c95ffaf046d9fee62fe20881f5185c/1964_Chevrolet_Impala_2025-09-08.pdf' },
  { id: 'oertank', title: 'OER – 1961-64 Impala/Bel Air/Biscayne 20-gallon fuel tank (dimensions, except wagon)', url: 'https://www.oerparts.com/product/ft4002b.html' },
  { id: 'carsinc', title: 'CARS Inc. – 1961-64 Impala fuel tank, 20 gal, 38-1/4 × 15-1/8 × 11-1/8 in', url: 'https://carsinc.com/en/item/6550/' },
  { id: 'earlybirds', title: 'Early Birds – Impala fuel tanks & related (strap seals, anti-squeak kit, 1964 filler neck, neoprene filler hose, grommet)', url: 'https://www.early-birds.ca/catalog-impala-fuel_tanks__related-2035.html' },
  { id: 'antisqueak', title: 'Auto Obsession – GM fuel-tank anti-squeak 5-piece kit (38 in cushions + anti-pop pad), fits 1964 Impala', url: 'https://autoobsession.com/product/fuel-tank-insulator-fqdw-w-862a' },
  { id: 'oerhw', title: 'OER – 1964 Impala fuel-tank hardware (straps, anti-squeak sets for 1 in straps, 1964 filler neck)', url: 'https://www.oerparts.com/shop/1964/chevrolet/impala/parts/fuel-system/fuel-tank-hardware/' },
  { id: 'tankkit', title: 'Classic Chevy – 1961-64 full-size gas tank kit (tank, 3/8 in sender, straps, anti-squeak kit)', url: 'https://www.classicchevy.ca/engine/fuel-system/gas-tanks/gas-tank-kits/full-size-chevy-gas-tank-kit-3-8-sending-unit-hardtop-3052891' },
  { id: 'hemtank', title: 'Hemmings – How to replace a failing fuel tank (GM tank strapped behind rear axle; insulating anti-squeak pads)', url: 'https://www.hemmings.com/stories/how-to-replace-a-failing-fuel-tank/' },
  { id: 'bbody', title: 'GM B platform – filler location (1961-64 cars: driver-side rear fender)', url: 'https://www.liquisearch.com/gm_b_platform' },
  { id: 'cifiller', title: 'Classic Industries – Impala fuel caps & doors (1964 Impala gas door guard)', url: 'https://www.classicindustries.com/shop/all-years/chevrolet/impala/parts/fuel-system/fuel-caps-doors/' },
];

const IN = 0.0254;
export const DIM = {
  wheelbase: 119.0 * IN,      // carfolio, ama, mt
  length: 209.9 * IN,         // carfolio, mt
  width: 78.1 * IN,           // ama W103, carfolio
  bodyWidth: 77.0 * IN,       // ama W116 max body width
  height: 55.8 * IN,          // carfolio (convertible)
  trackF: 60.3 * IN,          // ama W101, mt
  trackR: 59.3 * IN,          // ama W102, mt
  ground: 5.8 * IN,           // carfolio
  // Derived / approximate (not published in our sources):
  tireDia: 27.0 * IN,         // approx. from 7.50-14 tire size (carfolio, mt)
  frontOverhang: 37.5 * IN,   // approx. split of 90.9 in total overhang
};

export const APPROX = [
  'Front/rear overhang split (front ≈37.5 in, rear ≈53.4 in) – total overhang of 90.9 in is exact (209.9 − 119), the split is estimated.',
  'Tire overall diameter ≈27 in, derived from the 7.50-14 tire size.',
  'Beltline, hood, deck and windshield heights, cockpit opening and top-bow positions – shaped by eye to period photos.',
  'Placement and size of individual components (engine, transmission, frame rails, A-arms, seats, dash) – schematic, scaled to the published wheelbase/track.',
  'Paint swatch colours are screen approximations of the factory codes, not paint matches.',
  'Fuel tank position (behind the rear axle, under the trunk floor, above the rear frame rails) – the general GM layout per Hemmings; exact 1964 coordinates are estimated.',
  'Fuel-tank strap routing and anchor points, vent-hose routing, sending-unit location on the tank top, and the fuel-line path along the X-frame – schematic.',
  'Fuel-pump position on the engine and fuel-filler-door size/height on the left rear quarter – estimated.',
  'Insulator layout: the kit is 5 pieces (38 in cushions plus an anti-pop pad for the tank top); how the 5 pieces are split between tank top and straps here is an interpretation. Insulators are drawn in amber for visibility – originals are black rubber.',
  'Corrosion protection by the insulators is inferred (they stop metal-to-metal rubbing that wears through the coating); sources only state noise/wear.',
  'Number of body-mount positions on the frame is not published in our sources; markers show representative locations.',
];

export const PAINTS = [
  { name: 'Tuxedo Black', code: '900', hex: '#0d0d0f', metal: 0.2 },
  { name: 'Ermine White', code: '936', hex: '#efeee6', metal: 0.05 },
  { name: 'Daytona Blue', code: '916', hex: '#2f5f9e', metal: 0.55 },
  { name: 'Silver Blue', code: '912', hex: '#8fa6bf', metal: 0.6 },
  { name: 'Azure Aqua', code: '918', hex: '#4fb0b2', metal: 0.5 },
  { name: 'Lagoon Aqua', code: '919', hex: '#2c7f86', metal: 0.55 },
  { name: 'Bahama Green', code: '908', hex: '#5f8f63', metal: 0.55 },
  { name: 'Meadow Green', code: '905', hex: '#3d6046', metal: 0.5 },
  { name: 'Ember Red', code: '922', hex: '#8e1f23', metal: 0.45 },
  { name: 'Palomar Red', code: '948', hex: '#7a2230', metal: 0.6 },
  { name: 'Saddle Tan', code: '932', hex: '#9a774a', metal: 0.55 },
  { name: 'Almond Fawn', code: '920', hex: '#a68a62', metal: 0.5 },
  { name: 'Desert Beige', code: '938', hex: '#cdbb98', metal: 0.2 },
  { name: 'Satin Silver', code: '940', hex: '#b9bcbf', metal: 0.7 },
  { name: 'Goldwood Yellow', code: '943', hex: '#dcc774', metal: 0.3 },
];

export const ENGINES = [
  { id: '230', name: '230 cu in Turbo-Thrift I6', type: 'i6', hp: '140 @ 4,400', tq: '220 @ 1,600', cr: '8.5:1', bs: '3.875 × 3.25 in', carb: '1-barrel', trans: '3-spd manual (std), overdrive or Powerglide optional', src: 'hemmings, ci' },
  { id: '283', name: '283 cu in Turbo-Fire V8 (L32)', type: 'sbc', hp: '195 @ 4,800', tq: '285 @ 2,400', cr: '9.25:1', bs: '3.875 × 3.00 in', carb: '2-barrel', trans: '3-spd manual (std), overdrive or Powerglide optional', src: 'hemmings, carfolio, ci' },
  { id: 'L30', name: '327 cu in Turbo-Fire V8 (L30)', type: 'sbc', hp: '250 @ 4,400', tq: '350 @ 2,800', cr: '10.5:1', bs: '4.00 × 3.25 in', carb: '4-barrel, hydraulic lifters', trans: '3-spd, Muncie 4-spd or Powerglide', src: 'hemmings, mt' },
  { id: 'L74', name: '327 cu in Turbo-Fire V8 (L74)', type: 'sbc', hp: '300 @ 5,000', tq: '360 @ 3,200', cr: '10.5:1', bs: '4.00 × 3.25 in', carb: 'Carter AFB 4-barrel', trans: '3-spd, Muncie 4-spd or Powerglide', src: 'hemmings' },
  { id: 'L33', name: '409 cu in Turbo-Fire V8 (L33)', type: 'w409', hp: '340 @ 5,000', tq: '420 @ 3,200', cr: '10:1', bs: '4.3125 × 3.50 in', carb: '4-barrel, hydraulic lifters', trans: '4-spd or Powerglide', src: 'hemmings' },
  { id: 'L31', name: '409 cu in Turbo-Fire V8 (L31)', type: 'w409', hp: '400 @ 5,800', tq: '425 @ 3,600', cr: '11:1', bs: '4.3125 × 3.50 in', carb: '4-barrel, solid lifters, aluminium intake', trans: '4-spd manual only', src: 'hemmings' },
  { id: 'L80', name: '409 cu in Turbo-Fire V8 (L80)', type: 'w409', dual: true, hp: '425 @ 6,000', tq: '425 @ 4,200', cr: '11:1', bs: '4.3125 × 3.50 in', carb: 'Dual Carter AFB 4-barrels', trans: '4-spd manual only', src: 'hemmings' },
];

export const SYSTEMS = {
  fuel: {
    name: 'Fuel Tank & Lines', color: '#ffd23f', priority: true,
    blurb: 'A 20-gallon stamped-steel tank strapped up under the trunk floor behind the rear axle. A sending unit on top feeds a steel line that runs forward along the X-frame to the engine-driven fuel pump. On 1961-64 full-size Chevrolets the filler is in the driver-side (left) rear fender, not behind the licence plate (that arrived in 1965).',
    specs: [
      ['Capacity', '20 US gal (except wagons)', 'oertank, carsinc'],
      ['Tank size', '38-1/4 × 15-1/8 × 11-1/8 in (reproduction of original)', 'oertank, carsinc'],
      ['Construction', 'Stamped steel; repros zinc- or terne-coated', 'oertank'],
      ['Location', 'Strapped behind rear axle, under trunk floor (approx. for ’64)', 'hemtank'],
      ['Hold-down', '2 steel straps (pair), 1 in wide', 'oerhw'],
      ['Sending unit', '3/8 in outlet (V8, no return); 5/16 in also listed; lock ring + O-ring', 'tankkit, carsinc'],
      ['Filler', 'Left rear fender fuel door; 1964-specific filler neck; neoprene tank-to-neck hose; grommet at door', 'bbody, earlybirds, cifiller'],
      ['Lines', 'Fuel feed + vent, rubber hoses with clamps at the tank', 'hemtank'],
    ],
    concept: [
      'Moving the tank (e.g. ahead of the axle for crash safety) means new frame brackets, a new filler route through the quarter panel and a reshaped trunk floor.',
      'EFI swaps need an in-tank or external high-pressure pump and a return line — the 1961-64 EFI-ready tanks exist; the line must still follow the X-frame.',
      'A fuel cell in the trunk removes the under-floor tank but needs a sealed bulkhead and vent to the outside of the body.',
      'The dual exhaust passes beneath the tank: rerouting the tailpipes changes how much heat reaches the tank and fuel.',
    ],
  },
  insulation: {
    name: 'Tank Insulation', color: '#f0a23a', priority: true, sub: true,
    blurb: 'Rubber anti-squeak cushions sit between the tank and the trunk floor, and rubber strap seals sit between the steel hold-down straps and the tank. They stop metal-to-metal contact: no squeaks or rattles, less vibration transfer, and no wear-through of the tank coating.',
    specs: [
      ['Kit', '5-piece anti-squeak set: 38 in cushions + anti-pop pad for tank top (fits 1964 Impala)', 'antisqueak'],
      ['Strap seals', 'Rubber strip between steel straps and tank – stops metal-to-metal wear and squeaks', 'earlybirds'],
      ['Strap width', 'For 1 in wide straps', 'oerhw'],
      ['Material', 'Rubber (shown amber for visibility)', 'earlybirds, oerhw'],
      ['Install', 'Pads held on the tank with weatherstrip adhesive before raising it', 'hemtank'],
    ],
    purpose: [
      ['Noise', 'Stops squeaks and drumming between the tank, straps and trunk floor', 'earlybirds, antisqueak'],
      ['Vibration', 'Cushions the tank from body and straps', 'antisqueak'],
      ['Abrasion', 'Prevents metal-to-metal wear from vibration', 'earlybirds'],
      ['Corrosion', 'Inferred: keeps rubbing from wearing through the coating, where rust starts', ''],
      ['Exhaust heat', 'Not a heat shield – the original rubber pads only isolate; tailpipes run below the tank, so add a shield if heat matters', ''],
    ],
    concept: [
      'Closed-cell neoprene/EPDM foam pads resist fuel and water better than open-cell felt and don’t hold moisture against the tank.',
      'Add a reflective aluminium heat shield between the tailpipes and the tank floor, especially with a hotter 409 or headers.',
      'Stainless straps (offered for 1961-64) with fresh rubber seals eliminate the strap-rust-to-tank-rust chain.',
      'A fuel-cell concept still needs isolation: rubber-isolated mounting cradle plus a vapour-tight trunk bulkhead.',
      'Lining the trunk floor above the tank with sound-deadening mat reduces fuel slosh noise reaching the cabin.',
    ],
  },
  body: {
    name: 'Body & Sheet Metal', color: '#e9b44c',
    blurb: 'Welded steel body on a separate frame. 1964 styling: flat trunk lid, full-width grille with quad headlamps, a chrome strip from the hood centre to the taillights, and three round taillights per side set in a stamped alloy rear panel.',
    specs: [
      ['Overall length', '209.9 in', 'carfolio, mt'],
      ['Overall width', '78.1 in (car); 77.0 in max body', 'ama'],
      ['Height', '55.8 in', 'carfolio'],
      ['Ground clearance', '5.8 in', 'carfolio'],
      ['Construction', 'Welded steel body, separate frame', 'mt'],
      ['Taillamps', '3 round per side, alloy panel between', 'overview'],
      ['Paint', '15 solid colours, codes 900-948', 'colors, paintchart'],
    ],
    concept: [
      'Lowering the beltline or roof means re-working the top-stack geometry and windshield header the top latches to.',
      'Widening the body (e.g. to cover wider tires) changes the track you can fit inside the wheel openings — check against the 60.3/59.3 in tracks.',
      'Any new body still has to land on the X-frame mount points; a unibody concept would need side-rail stiffness the X-frame never provided (the X-frame has no outer rails along the rockers).',
      'A convertible has no roof to carry loads, so a lighter body concept must keep or add rocker/cowl stiffness.',
    ],
  },
  chassis: {
    name: 'Chassis (X-Frame)', color: '#5cc8ff',
    blurb: 'GM 1958-64 “X” frame: box-girder rails that cross under the centre of the car, with a boxed centre section. It let the body sit low but required a two-piece driveshaft through the X with a carrier bearing.',
    specs: [
      ['Wheelbase', '119.0 in', 'carfolio, ama, mt'],
      ['Frame type', 'X-member welded frame, box-girder side rails', 'mt'],
      ['Centre section', 'Boxed, joins front & rear of the X', 'hemmings'],
      ['Driveshaft', '2-piece, carrier bearing at X', 'hemmings, mt'],
      ['Weak spot', 'Rear rails around trunk floor (rust)', 'hemmings'],
    ],
    concept: [
      'Stiffening the X-frame (or adding perimeter rails) gives a convertible concept less cowl shake but changes body-mount locations.',
      'A one-piece driveshaft needs the X centre opened up — that ripples into floor-pan tunnel shape and exhaust routing.',
      'Moving rear spring/arm brackets to perimeter rails would let the rear axle be relocated for a longer-wheelbase concept.',
    ],
  },
  engine: {
    name: 'Engine & Drivetrain', color: '#ff7a45',
    blurb: 'Front-mounted, rear-wheel drive. Engines ranged from the 230 six to three versions of the 409 “W” big-block. Power reaches a hypoid, semi-floating rear axle through a two-piece open driveshaft.',
    specs: [
      ['Selected engine', '—', ''],
      ['Transmissions', '3-spd (std), 3-spd + OD, Powerglide 2-spd, Muncie 4-spd', 'hemmings, hemmings2'],
      ['Driveshaft', '2-piece open tube', 'mt'],
      ['Differential', 'Hypoid, semi-floating; Positraction optional', 'mt, hemmings'],
      ['Axle ratio (MT test car)', '3.08:1', 'mt'],
    ],
    concept: [
      'A bigger engine (409) is wider and heavier: it needs different mounts on the front crossmember and pushes front spring rates up.',
      'An electric-drive concept removes the transmission tunnel load path — the X-frame centre and two-piece shaft become optional.',
      'Moving to a 4-speed means a floor shifter through the floor pan and console (SS interior) instead of the column.',
      'More torque stresses the rear lower control arms, upper arm and Panhard rod brackets on the frame.',
    ],
  },
  suspension: {
    name: 'Suspension, Steering & Brakes', color: '#7ee081',
    blurb: 'Coil springs at all four corners. Front: independent SLA (upper and lower stamped A-arms, ball joints). Rear: live axle on two lower control arms, a single upper arm on the right and a diagonal Panhard rod.',
    specs: [
      ['Front', 'Independent SLA, coil springs, tubular shocks, anti-sway bar', 'mt, hemmings'],
      ['Rear', 'Coil springs, 2 lower arms + 1 upper arm (right) + Panhard rod', 'hemmings, mt'],
      ['Steering', 'Recirculating ball; power assist via hydraulic ram (opt.)', 'mt, hemmings'],
      ['Brakes', '11 in drums all round, duo-servo, self-adjusting', 'mt, hemmings'],
      ['Track F / R', '60.3 in / 59.3 in', 'ama, mt'],
      ['Wheels / tires', '14 × 5.0 in steel; 7.50-14', 'carfolio, mt'],
    ],
    concept: [
      'Front disc brakes need new spindles/knuckles — that changes A-arm ball-joint geometry and wheel offset.',
      'Air-ride (lowrider culture) reuses the coil pockets on the frame but adds tanks/lines through the body and trunk.',
      'A wider track alters scrub radius and needs the body wheel openings checked.',
      'Replacing the Panhard rod with a Watt’s link moves brackets from frame to axle housing.',
    ],
  },
  interior: {
    name: 'Interior', color: '#c792ea',
    blurb: 'Impala SS models had an all-vinyl interior with bucket seats and a centre console (4-speed and Powerglide cars); regular Impalas used a bench with colour-keyed cloth/vinyl trim.',
    specs: [
      ['Seating (convertible)', 'Impala: 5-passenger; Impala SS: 4-passenger', 'ama'],
      ['SS trim', 'All-vinyl, bucket seats, centre console', 'overview'],
      ['Interior colours', 'Blue, Green, Red, Fawn, Aqua, Gold', 'overview'],
      ['Steering column', 'Column shift (3-spd/PG) or floor shift (4-spd)', 'hemmings2'],
    ],
    concept: [
      'Seat tracks bolt to the floor pan, which sits over the X-frame centre: a lower seating position needs a new floor.',
      'Modern safety belts/airbags need anchor points the convertible body was never designed for.',
      'Moving the shifter to the floor ties the interior to transmission choice.',
    ],
  },
  top: {
    name: 'Convertible Top', color: '#ff5d8f',
    blurb: 'Power folding top (“Hydro-Lectric”): a 12 V motor-pump drives two hydraulic lift cylinders that move the side-rail linkage. The top frame pivots on body brackets in the rear quarters and latches to the windshield header.',
    specs: [
      ['Factory fabric', 'Pinpoint vinyl, black or white', 'toptech, overview'],
      ['Rear window', 'Zippered plastic (original)', 'toptech'],
      ['Actuation', '12 V motor-pump, 2 lift cylinders, ATF', 'toptech'],
      ['Frame mount', 'Rear side rail → body top pivot bracket (rear quarter)', 'shafers'],
      ['Front', 'Header bow to front side rail; latches to windshield header', 'shafers'],
    ],
    concept: [
      'A lower, chopped top changes bow lengths and the pivot bracket position on the body quarter.',
      'An electric screw-drive top removes hydraulic lines that run from the pump behind the rear seat to both quarters.',
      'A hard-top concept must carry loads through the same quarter brackets — or add new ones to the body.',
    ],
  },
};

// Connections: positions in car-space (metres, x forward, y up, z right).
export const CONNECTIONS = [
  { a: 'engine', b: 'chassis', name: 'Engine front mounts → front crossmember', p: [1.62, 0.36, -0.30], p2: [1.62, 0.26, -0.32] },
  { a: 'engine', b: 'chassis', name: 'Engine front mounts → front crossmember', p: [1.62, 0.36, 0.30], p2: [1.62, 0.26, 0.32] },
  { a: 'engine', b: 'chassis', name: 'Transmission rear mount → X-frame crossmember', p: [0.45, 0.30, 0], p2: [0.45, 0.22, 0] },
  { a: 'engine', b: 'chassis', name: 'Driveshaft carrier bearing → X centre section', p: [-0.15, 0.30, 0], p2: [-0.15, 0.22, 0] },
  { a: 'engine', b: 'suspension', name: 'Rear axle housing → lower control arms', p: [-1.31, 0.30, -0.55], p2: [-1.31, 0.25, -0.55] },
  { a: 'engine', b: 'suspension', name: 'Axle housing → coil springs / upper arm / Panhard rod', p: [-1.31, 0.40, 0.55], p2: [-1.31, 0.45, 0.55] },
  { a: 'suspension', b: 'chassis', name: 'Front A-arm pivots & coil pockets → front crossmember', p: [1.71, 0.30, -0.42], p2: [1.71, 0.24, -0.40] },
  { a: 'suspension', b: 'chassis', name: 'Front A-arm pivots & coil pockets → front crossmember', p: [1.71, 0.30, 0.42], p2: [1.71, 0.24, 0.40] },
  { a: 'suspension', b: 'chassis', name: 'Rear lower-arm brackets (outboard of frame)', p: [-0.75, 0.24, -0.56], p2: [-0.75, 0.24, -0.42] },
  { a: 'suspension', b: 'chassis', name: 'Steering gearbox → left frame rail', p: [2.0, 0.30, -0.40], p2: [2.0, 0.24, -0.42] },
  { a: 'body', b: 'chassis', name: 'Rubber-cushioned body mounts (representative)', p: [2.2, 0.33, -0.45], p2: [2.2, 0.26, -0.45] },
  { a: 'body', b: 'chassis', name: 'Rubber-cushioned body mounts (representative)', p: [0.9, 0.33, 0.42], p2: [0.9, 0.26, 0.40] },
  { a: 'body', b: 'chassis', name: 'Rubber-cushioned body mounts (representative)', p: [-1.9, 0.42, -0.48], p2: [-1.9, 0.34, -0.48] },
  { a: 'top', b: 'body', name: 'Rear side rail → body top pivot bracket (each rear quarter)', p: [-0.95, 0.92, -0.80], p2: [-0.95, 0.85, -0.86] },
  { a: 'top', b: 'body', name: 'Rear side rail → body top pivot bracket (each rear quarter)', p: [-0.95, 0.92, 0.80], p2: [-0.95, 0.85, 0.86] },
  { a: 'top', b: 'body', name: 'Header bow latches → windshield header', p: [0.18, 1.38, 0], p2: [0.22, 1.33, 0] },
  { a: 'top', b: 'interior', name: 'Motor-pump & hoses behind rear seat; dash top switch', p: [-1.12, 0.62, 0], p2: [-1.02, 0.62, 0] },
  { a: 'interior', b: 'body', name: 'Seat tracks → floor pan', p: [-0.12, 0.45, -0.36], p2: [-0.12, 0.40, -0.36] },
  { a: 'interior', b: 'body', name: 'Instrument panel → cowl', p: [0.42, 0.88, 0.5], p2: [0.5, 0.90, 0.5] },
  { a: 'interior', b: 'suspension', name: 'Steering column → recirculating-ball gearbox', p: [0.45, 0.75, -0.37], p2: [1.95, 0.32, -0.40] },
  { a: 'interior', b: 'engine', name: 'Shifter (column or SS console floor shift) → transmission', p: [0.15, 0.55, 0], p2: [0.65, 0.40, 0] },
  { a: 'engine', b: 'body', name: 'Radiator → radiator support; firewall pass-throughs', p: [2.3, 0.6, 0], p2: [2.42, 0.6, 0] },
  { a: 'fuel', b: 'chassis', name: 'Front strap anchors → frame rear crossmember', p: [-1.66, 0.45, -0.30], p2: [-1.62, 0.42, -0.30] },
  { a: 'fuel', b: 'chassis', name: 'Front strap anchors → frame rear crossmember', p: [-1.66, 0.45, 0.30], p2: [-1.62, 0.42, 0.30] },
  { a: 'fuel', b: 'body', name: 'Rear strap bolts → trunk floor', p: [-2.154, 0.72, -0.30], p2: [-2.154, 0.76, -0.30] },
  { a: 'fuel', b: 'body', name: 'Rear strap bolts → trunk floor', p: [-2.154, 0.72, 0.30], p2: [-2.154, 0.76, 0.30] },
  { a: 'fuel', b: 'body', name: 'Filler neck → left rear-quarter fuel door & grommet', p: [-2.15, 0.80, -0.95], p2: [-2.15, 0.80, -0.985] },
  { a: 'fuel', b: 'engine', name: '3/8 in fuel line → engine-driven fuel pump', p: [1.77, 0.335, 0.235], p2: [1.77, 0.335, 0.19] },
  { a: 'fuel', b: 'engine', name: 'Exhaust heat zone: tailpipes pass beneath the tank', p: [-1.95, 0.40, 0.40], p2: [-1.95, 0.27, 0.40] },
  { a: 'fuel', b: 'interior', name: 'Sending-unit wire → dash fuel gauge (via rear body harness)', p: [-1.85, 0.72, 0.25], p2: [0.37, 0.89, -0.30] },
  { a: 'insulation', b: 'body', name: 'Anti-squeak cushions & anti-pop pad → trunk floor', p: [-1.95, 0.70, -0.06], p2: [-1.95, 0.75, -0.06] },
  { a: 'insulation', b: 'fuel', name: 'Strap seals between steel straps and tank', p: [-1.95, 0.398, -0.30], p2: [-1.95, 0.384, -0.30] },
  { a: 'insulation', b: 'fuel', name: 'Strap seals between steel straps and tank', p: [-1.95, 0.398, 0.30], p2: [-1.95, 0.384, 0.30] },
  { a: 'insulation', b: 'fuel', name: 'Cushions bonded to tank top (weatherstrip adhesive)', p: [-1.80, 0.70, 0.3], p2: [-1.80, 0.687, 0.3] },
];

// Explode vectors (metres) for each system at explode = 1.
export const EXPLODE = {
  top: [ -0.25, 2.45, 0 ],
  body: [ 0, 1.45, 0 ],
  interior: [ -0.25, 0.72, 0 ],
  engine: [ 0.95, 0.30, 0 ],
  suspension: [ 0, -0.32, 0 ],
  chassis: [ 0, -0.80, 0 ],
  fuel: [ -1.0, 0.12, 0 ],
  insulation: [ -1.0, 0.12, 0 ],
};
