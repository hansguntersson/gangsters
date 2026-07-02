var MAP_LOCATIONS_DATA = {
  "image": {
    "file": "map-background.png",
    "width": 1024,
    "height": 1536
  },
  "coordinate_origin": "top-left pixels",
  "street_centerlines": {
    "vertical": {
      "West St": {
        "x": 52,
        "note": "constant"
      },
      "Pine St": {
        "x": 315,
        "note": "constant"
      },
      "Elm St": {
        "x": 558,
        "note": "constant"
      },
      "River St": {
        "note": "curves - x varies by row band",
        "at_Riverside_Ave": 800,
        "at_Harrison_Ave": 865,
        "at_Madison_Ave": 860,
        "at_Jefferson_Ave": 868,
        "at_Franklin_Ave": 900,
        "at_Oakwood_Ave": 910
      }
    },
    "horizontal": {
      "Riverside Ave": {
        "y": 50
      },
      "Harrison Ave": {
        "y": 260
      },
      "Madison Ave": {
        "y": 557
      },
      "Jefferson Ave": {
        "y": 860
      },
      "Franklin Ave": {
        "y": 1113
      },
      "Oakwood Ave": {
        "y": 1428,
        "note": "partially cropped at bottom of image"
      }
    }
  },
  "intersections": [
    {
      "name": "West & Riverside",
      "x": 52,
      "y": 50
    },
    {
      "name": "Pine & Riverside",
      "x": 315,
      "y": 50
    },
    {
      "name": "Elm & Riverside",
      "x": 558,
      "y": 50
    },
    {
      "name": "River & Riverside",
      "x": 800,
      "y": 50
    },
    {
      "name": "West & Harrison",
      "x": 52,
      "y": 260
    },
    {
      "name": "Pine & Harrison",
      "x": 315,
      "y": 260
    },
    {
      "name": "Elm & Harrison",
      "x": 558,
      "y": 260
    },
    {
      "name": "River & Harrison",
      "x": 865,
      "y": 260
    },
    {
      "name": "West & Madison",
      "x": 52,
      "y": 557
    },
    {
      "name": "Pine & Madison",
      "x": 315,
      "y": 557
    },
    {
      "name": "Elm & Madison",
      "x": 558,
      "y": 557
    },
    {
      "name": "River & Madison",
      "x": 860,
      "y": 557
    },
    {
      "name": "West & Jefferson",
      "x": 52,
      "y": 860
    },
    {
      "name": "Pine & Jefferson",
      "x": 315,
      "y": 860
    },
    {
      "name": "Elm & Jefferson",
      "x": 558,
      "y": 860
    },
    {
      "name": "River & Jefferson",
      "x": 868,
      "y": 860
    },
    {
      "name": "West & Franklin",
      "x": 52,
      "y": 1113
    },
    {
      "name": "Pine & Franklin",
      "x": 315,
      "y": 1113
    },
    {
      "name": "Elm & Franklin",
      "x": 558,
      "y": 1113
    },
    {
      "name": "River & Franklin",
      "x": 900,
      "y": 1113
    },
    {
      "name": "West & Oakwood",
      "x": 52,
      "y": 1428
    },
    {
      "name": "Pine & Oakwood",
      "x": 315,
      "y": 1428
    },
    {
      "name": "Elm & Oakwood",
      "x": 558,
      "y": 1428
    },
    {
      "name": "River & Oakwood",
      "x": 910,
      "y": 1428
    }
  ],
  "block_centers": [
    {
      "id": "A1",
      "x": 183,
      "y": 155,
      "building_type": "House",
      "gang": "Riverside Syndicate"
    },
    {
      "id": "B1",
      "x": 436,
      "y": 155,
      "building_type": "Car park",
      "gang": "Riverside Syndicate"
    },
    {
      "id": "C1",
      "x": 679,
      "y": 155,
      "building_type": "Shopfront / mixed-use",
      "gang": "The Longshoremen"
    },
    {
      "id": "A2",
      "x": 183,
      "y": 408,
      "building_type": "House",
      "gang": "Riverside Syndicate"
    },
    {
      "id": "B2",
      "x": 436,
      "y": 408,
      "building_type": "Shopfront / mixed-use",
      "gang": "Riverside Syndicate"
    },
    {
      "id": "C2",
      "x": 711,
      "y": 408,
      "building_type": "Warehouse",
      "gang": "The Longshoremen"
    },
    {
      "id": "A3",
      "x": 183,
      "y": 708,
      "building_type": "House",
      "gang": null
    },
    {
      "id": "B3",
      "x": 436,
      "y": 708,
      "building_type": "House",
      "gang": null
    },
    {
      "id": "C3",
      "x": 709,
      "y": 708,
      "building_type": "Warehouse",
      "gang": "The Longshoremen"
    },
    {
      "id": "A4",
      "x": 183,
      "y": 986,
      "building_type": "Factory",
      "gang": "Factory Boys"
    },
    {
      "id": "B4",
      "x": 436,
      "y": 986,
      "building_type": "Park",
      "gang": "Factory Boys"
    },
    {
      "id": "C4",
      "x": 713,
      "y": 986,
      "building_type": "Warehouse",
      "gang": "The Longshoremen"
    },
    {
      "id": "A5",
      "x": 183,
      "y": 1270,
      "building_type": "Tenement",
      "gang": "Oakwood Crew"
    },
    {
      "id": "B5",
      "x": 436,
      "y": 1270,
      "building_type": "Tenement",
      "gang": "Oakwood Crew"
    },
    {
      "id": "C5",
      "x": 729,
      "y": 1270,
      "building_type": "Shopfront / mixed-use",
      "gang": "Oakwood Crew"
    }
  ],
  "categories": [
    "House",
    "Tenement",
    "Shopfront / mixed-use",
    "Warehouse",
    "Factory",
    "Car park",
    "Park",
    "Pier"
  ],
  "locations": [
    {
      "id": "L001",
      "name": "Gardner House",
      "category": "House",
      "x": 118,
      "y": 150,
      "bounds": [
        75,
        90,
        162,
        210
      ],
      "block": "A1",
      "streets": [
        "West St",
        "Pine St"
      ],
      "avenues": [
        "Riverside Ave",
        "Harrison Ave"
      ],
      "gang": "Riverside Syndicate",
      "notes": "north-west corner house"
    },
    {
      "id": "L002",
      "name": "Miller House",
      "category": "House",
      "x": 239,
      "y": 170,
      "bounds": [
        196,
        125,
        282,
        215
      ],
      "block": "A1",
      "streets": [
        "West St",
        "Pine St"
      ],
      "avenues": [
        "Riverside Ave",
        "Harrison Ave"
      ],
      "gang": "Riverside Syndicate",
      "notes": "Riverside frontage"
    },
    {
      "id": "L003",
      "name": "Riverside Car Park",
      "category": "Car park",
      "x": 438,
      "y": 145,
      "bounds": [
        345,
        58,
        530,
        232
      ],
      "block": "B1",
      "streets": [
        "Pine St",
        "Elm St"
      ],
      "avenues": [
        "Riverside Ave",
        "Harrison Ave"
      ],
      "gang": "Riverside Syndicate",
      "notes": "large open lot"
    },
    {
      "id": "L004",
      "name": "Riverside Pharmacy",
      "category": "Shopfront / mixed-use",
      "x": 648,
      "y": 144,
      "bounds": [
        596,
        72,
        700,
        216
      ],
      "block": "C1",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Riverside Ave",
        "Harrison Ave"
      ],
      "gang": "The Longshoremen",
      "notes": "upper-left unit"
    },
    {
      "id": "L005",
      "name": "First National Bank",
      "category": "Shopfront / mixed-use",
      "x": 759,
      "y": 145,
      "bounds": [
        711,
        70,
        807,
        220
      ],
      "block": "C1",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Riverside Ave",
        "Harrison Ave"
      ],
      "gang": "The Longshoremen",
      "notes": "corner mixed-use unit"
    },
    {
      "id": "L006",
      "name": "Harrison Boarding House",
      "category": "House",
      "x": 108,
      "y": 344,
      "bounds": [
        72,
        292,
        143,
        395
      ],
      "block": "A2",
      "streets": [
        "West St",
        "Pine St"
      ],
      "avenues": [
        "Harrison Ave",
        "Madison Ave"
      ],
      "gang": "Riverside Syndicate",
      "notes": "west-side house"
    },
    {
      "id": "L007",
      "name": "The Walsh Residence",
      "category": "House",
      "x": 119,
      "y": 475,
      "bounds": [
        73,
        430,
        165,
        520
      ],
      "block": "A2",
      "streets": [
        "West St",
        "Pine St"
      ],
      "avenues": [
        "Harrison Ave",
        "Madison Ave"
      ],
      "gang": "Riverside Syndicate",
      "notes": "south-west house"
    },
    {
      "id": "L008",
      "name": "Harrison Apartments",
      "category": "Tenement",
      "x": 214,
      "y": 343,
      "bounds": [
        181,
        294,
        248,
        392
      ],
      "block": "A2",
      "streets": [
        "West St",
        "Pine St"
      ],
      "avenues": [
        "Harrison Ave",
        "Madison Ave"
      ],
      "gang": "Riverside Syndicate",
      "notes": "central light-roof block"
    },
    {
      "id": "L009",
      "name": "Pine Court Annex",
      "category": "Tenement",
      "x": 242,
      "y": 453,
      "bounds": [
        200,
        390,
        285,
        516
      ],
      "block": "A2",
      "streets": [
        "West St",
        "Pine St"
      ],
      "avenues": [
        "Harrison Ave",
        "Madison Ave"
      ],
      "gang": "Riverside Syndicate",
      "notes": "rear apartment cluster"
    },
    {
      "id": "L010",
      "name": "Murphy Grocery",
      "category": "Shopfront / mixed-use",
      "x": 396,
      "y": 358,
      "bounds": [
        356,
        305,
        435,
        410
      ],
      "block": "B2",
      "streets": [
        "Pine St",
        "Elm St"
      ],
      "avenues": [
        "Harrison Ave",
        "Madison Ave"
      ],
      "gang": "Riverside Syndicate",
      "notes": "Harrison frontage shop"
    },
    {
      "id": "L011",
      "name": "Bennett Hardware",
      "category": "Shopfront / mixed-use",
      "x": 492,
      "y": 359,
      "bounds": [
        454,
        300,
        530,
        418
      ],
      "block": "B2",
      "streets": [
        "Pine St",
        "Elm St"
      ],
      "avenues": [
        "Harrison Ave",
        "Madison Ave"
      ],
      "gang": "Riverside Syndicate",
      "notes": "north-east corner shop"
    },
    {
      "id": "L012",
      "name": "Jefferson Diner Prep Yard",
      "category": "Shopfront / mixed-use",
      "x": 399,
      "y": 470,
      "bounds": [
        346,
        422,
        452,
        518
      ],
      "block": "B2",
      "streets": [
        "Pine St",
        "Elm St"
      ],
      "avenues": [
        "Harrison Ave",
        "Madison Ave"
      ],
      "gang": "Riverside Syndicate",
      "notes": "service building"
    },
    {
      "id": "L013",
      "name": "King Barber Shop",
      "category": "Shopfront / mixed-use",
      "x": 493,
      "y": 481,
      "bounds": [
        452,
        444,
        534,
        518
      ],
      "block": "B2",
      "streets": [
        "Pine St",
        "Elm St"
      ],
      "avenues": [
        "Harrison Ave",
        "Madison Ave"
      ],
      "gang": "Riverside Syndicate",
      "notes": "south-east shop"
    },
    {
      "id": "L014",
      "name": "Harbour Freight",
      "category": "Warehouse",
      "x": 645,
      "y": 404,
      "bounds": [
        600,
        294,
        690,
        513
      ],
      "block": "C2",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Harrison Ave",
        "Madison Ave"
      ],
      "gang": "The Longshoremen",
      "notes": "long west warehouse"
    },
    {
      "id": "L015",
      "name": "Pier 3 Warehouse",
      "category": "Warehouse",
      "x": 753,
      "y": 363,
      "bounds": [
        696,
        300,
        810,
        426
      ],
      "block": "C2",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Harrison Ave",
        "Madison Ave"
      ],
      "gang": "The Longshoremen",
      "notes": "waterfront warehouse"
    },
    {
      "id": "L016",
      "name": "Dock Stores",
      "category": "Warehouse",
      "x": 768,
      "y": 481,
      "bounds": [
        724,
        442,
        813,
        520
      ],
      "block": "C2",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Harrison Ave",
        "Madison Ave"
      ],
      "gang": "The Longshoremen",
      "notes": "small dockside storehouse"
    },
    {
      "id": "L017",
      "name": "North Pier",
      "category": "Pier",
      "x": 944,
      "y": 330,
      "bounds": [
        908,
        313,
        979,
        348
      ],
      "block": "C2",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Harrison Ave",
        "Madison Ave"
      ],
      "gang": "The Longshoremen",
      "notes": "upper river pier"
    },
    {
      "id": "L018",
      "name": "Aster House",
      "category": "House",
      "x": 119,
      "y": 640,
      "bounds": [
        73,
        590,
        165,
        690
      ],
      "block": "A3",
      "streets": [
        "West St",
        "Pine St"
      ],
      "avenues": [
        "Madison Ave",
        "Jefferson Ave"
      ],
      "gang": null,
      "notes": "north-west home"
    },
    {
      "id": "L019",
      "name": "24 Madison Avenue",
      "category": "House",
      "x": 230,
      "y": 638,
      "bounds": [
        190,
        585,
        270,
        690
      ],
      "block": "A3",
      "streets": [
        "West St",
        "Pine St"
      ],
      "avenues": [
        "Madison Ave",
        "Jefferson Ave"
      ],
      "gang": null,
      "notes": "north-east home"
    },
    {
      "id": "L020",
      "name": "15 West Street",
      "category": "House",
      "x": 112,
      "y": 750,
      "bounds": [
        64,
        705,
        160,
        795
      ],
      "block": "A3",
      "streets": [
        "West St",
        "Pine St"
      ],
      "avenues": [
        "Madison Ave",
        "Jefferson Ave"
      ],
      "gang": null,
      "notes": "south-west home"
    },
    {
      "id": "L021",
      "name": "The Donovan House",
      "category": "House",
      "x": 237,
      "y": 750,
      "bounds": [
        188,
        700,
        286,
        800
      ],
      "block": "A3",
      "streets": [
        "West St",
        "Pine St"
      ],
      "avenues": [
        "Madison Ave",
        "Jefferson Ave"
      ],
      "gang": null,
      "notes": "south-east home"
    },
    {
      "id": "L022",
      "name": "Madison Rooms",
      "category": "Tenement",
      "x": 386,
      "y": 638,
      "bounds": [
        352,
        586,
        421,
        690
      ],
      "block": "B3",
      "streets": [
        "Pine St",
        "Elm St"
      ],
      "avenues": [
        "Madison Ave",
        "Jefferson Ave"
      ],
      "gang": null,
      "notes": "north-west apartments"
    },
    {
      "id": "L023",
      "name": "Elm View",
      "category": "House",
      "x": 478,
      "y": 630,
      "bounds": [
        439,
        590,
        516,
        671
      ],
      "block": "B3",
      "streets": [
        "Pine St",
        "Elm St"
      ],
      "avenues": [
        "Madison Ave",
        "Jefferson Ave"
      ],
      "gang": null,
      "notes": "north-east house"
    },
    {
      "id": "L024",
      "name": "Founders House",
      "category": "House",
      "x": 395,
      "y": 765,
      "bounds": [
        355,
        730,
        435,
        800
      ],
      "block": "B3",
      "streets": [
        "Pine St",
        "Elm St"
      ],
      "avenues": [
        "Madison Ave",
        "Jefferson Ave"
      ],
      "gang": null,
      "notes": "south-west house"
    },
    {
      "id": "L025",
      "name": "Parker Residence",
      "category": "House",
      "x": 483,
      "y": 751,
      "bounds": [
        432,
        700,
        534,
        802
      ],
      "block": "B3",
      "streets": [
        "Pine St",
        "Elm St"
      ],
      "avenues": [
        "Madison Ave",
        "Jefferson Ave"
      ],
      "gang": null,
      "notes": "south-east L-shaped house"
    },
    {
      "id": "L026",
      "name": "Madison Cold Storage",
      "category": "Warehouse",
      "x": 645,
      "y": 665,
      "bounds": [
        600,
        590,
        690,
        740
      ],
      "block": "C3",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Madison Ave",
        "Jefferson Ave"
      ],
      "gang": "The Longshoremen",
      "notes": "west warehouse"
    },
    {
      "id": "L027",
      "name": "Union Warehouse",
      "category": "Warehouse",
      "x": 745,
      "y": 639,
      "bounds": [
        690,
        588,
        800,
        690
      ],
      "block": "C3",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Madison Ave",
        "Jefferson Ave"
      ],
      "gang": "The Longshoremen",
      "notes": "north-east warehouse"
    },
    {
      "id": "L028",
      "name": "Elm Storage",
      "category": "Warehouse",
      "x": 640,
      "y": 772,
      "bounds": [
        598,
        742,
        682,
        802
      ],
      "block": "C3",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Madison Ave",
        "Jefferson Ave"
      ],
      "gang": "The Longshoremen",
      "notes": "south-west warehouse"
    },
    {
      "id": "L029",
      "name": "Bonded Warehouse No. 2",
      "category": "Warehouse",
      "x": 766,
      "y": 754,
      "bounds": [
        720,
        705,
        812,
        802
      ],
      "block": "C3",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Madison Ave",
        "Jefferson Ave"
      ],
      "gang": "The Longshoremen",
      "notes": "south-east warehouse"
    },
    {
      "id": "L030",
      "name": "South Pier",
      "category": "Pier",
      "x": 949,
      "y": 755,
      "bounds": [
        914,
        740,
        984,
        770
      ],
      "block": "C3",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Madison Ave",
        "Jefferson Ave"
      ],
      "gang": "The Longshoremen",
      "notes": "middle river pier"
    },
    {
      "id": "L031",
      "name": "Franklin Foundry",
      "category": "Factory",
      "x": 170,
      "y": 978,
      "bounds": [
        60,
        890,
        280,
        1065
      ],
      "block": "A4",
      "streets": [
        "West St",
        "Pine St"
      ],
      "avenues": [
        "Jefferson Ave",
        "Franklin Ave"
      ],
      "gang": "Factory Boys",
      "notes": "large factory yard and building"
    },
    {
      "id": "L032",
      "name": "Foundry Yard",
      "category": "Car park",
      "x": 220,
      "y": 978,
      "bounds": [
        160,
        890,
        280,
        1065
      ],
      "block": "A4",
      "streets": [
        "West St",
        "Pine St"
      ],
      "avenues": [
        "Jefferson Ave",
        "Franklin Ave"
      ],
      "gang": "Factory Boys",
      "notes": "internal truck yard"
    },
    {
      "id": "L033",
      "name": "Jefferson Parking Lot",
      "category": "Car park",
      "x": 405,
      "y": 986,
      "bounds": [
        340,
        882,
        470,
        1090
      ],
      "block": "B4",
      "streets": [
        "Pine St",
        "Elm St"
      ],
      "avenues": [
        "Jefferson Ave",
        "Franklin Ave"
      ],
      "gang": "Factory Boys",
      "notes": "open lot by Jefferson"
    },
    {
      "id": "L034",
      "name": "Empire Restaurant",
      "category": "Shopfront / mixed-use",
      "x": 501,
      "y": 932,
      "bounds": [
        472,
        878,
        530,
        985
      ],
      "block": "B4",
      "streets": [
        "Pine St",
        "Elm St"
      ],
      "avenues": [
        "Jefferson Ave",
        "Franklin Ave"
      ],
      "gang": "Factory Boys",
      "notes": "restaurant building"
    },
    {
      "id": "L035",
      "name": "Oakwood Tailors",
      "category": "Shopfront / mixed-use",
      "x": 495,
      "y": 1036,
      "bounds": [
        462,
        988,
        528,
        1085
      ],
      "block": "B4",
      "streets": [
        "Pine St",
        "Elm St"
      ],
      "avenues": [
        "Jefferson Ave",
        "Franklin Ave"
      ],
      "gang": "Factory Boys",
      "notes": "small store"
    },
    {
      "id": "L036",
      "name": "Atlantic Storage",
      "category": "Warehouse",
      "x": 642,
      "y": 950,
      "bounds": [
        594,
        888,
        690,
        1012
      ],
      "block": "C4",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Jefferson Ave",
        "Franklin Ave"
      ],
      "gang": "The Longshoremen",
      "notes": "north-west warehouse"
    },
    {
      "id": "L037",
      "name": "Harbour Logistics",
      "category": "Warehouse",
      "x": 750,
      "y": 932,
      "bounds": [
        690,
        884,
        810,
        980
      ],
      "block": "C4",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Jefferson Ave",
        "Franklin Ave"
      ],
      "gang": "The Longshoremen",
      "notes": "north-east warehouse"
    },
    {
      "id": "L038",
      "name": "River Trading Company",
      "category": "Warehouse",
      "x": 642,
      "y": 1042,
      "bounds": [
        594,
        1000,
        690,
        1085
      ],
      "block": "C4",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Jefferson Ave",
        "Franklin Ave"
      ],
      "gang": "The Longshoremen",
      "notes": "south-west warehouse"
    },
    {
      "id": "L039",
      "name": "Freeman Distribution",
      "category": "Warehouse",
      "x": 758,
      "y": 1038,
      "bounds": [
        706,
        990,
        810,
        1085
      ],
      "block": "C4",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Jefferson Ave",
        "Franklin Ave"
      ],
      "gang": "The Longshoremen",
      "notes": "south-east warehouse"
    },
    {
      "id": "L040",
      "name": "Commercial Pier",
      "category": "Pier",
      "x": 952,
      "y": 1000,
      "bounds": [
        925,
        984,
        980,
        1015
      ],
      "block": "C4",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Jefferson Ave",
        "Franklin Ave"
      ],
      "gang": "The Longshoremen",
      "notes": "lower river pier"
    },
    {
      "id": "L041",
      "name": "West End Depot",
      "category": "Warehouse",
      "x": 112,
      "y": 1200,
      "bounds": [
        72,
        1140,
        152,
        1260
      ],
      "block": "A5",
      "streets": [
        "West St",
        "Pine St"
      ],
      "avenues": [
        "Franklin Ave",
        "Oakwood Ave"
      ],
      "gang": "Oakwood Crew",
      "notes": "north-west warehouse"
    },
    {
      "id": "L042",
      "name": "Market Parking",
      "category": "Car park",
      "x": 220,
      "y": 1192,
      "bounds": [
        158,
        1140,
        282,
        1245
      ],
      "block": "A5",
      "streets": [
        "West St",
        "Pine St"
      ],
      "avenues": [
        "Franklin Ave",
        "Oakwood Ave"
      ],
      "gang": "Oakwood Crew",
      "notes": "open parking court"
    },
    {
      "id": "L043",
      "name": "Oakwood Garage",
      "category": "Warehouse",
      "x": 112,
      "y": 1342,
      "bounds": [
        63,
        1280,
        162,
        1405
      ],
      "block": "A5",
      "streets": [
        "West St",
        "Pine St"
      ],
      "avenues": [
        "Franklin Ave",
        "Oakwood Ave"
      ],
      "gang": "Oakwood Crew",
      "notes": "garage/workshop footprint"
    },
    {
      "id": "L044",
      "name": "Franklin Pawn Brokers",
      "category": "Shopfront / mixed-use",
      "x": 234,
      "y": 1342,
      "bounds": [
        190,
        1278,
        278,
        1405
      ],
      "block": "A5",
      "streets": [
        "West St",
        "Pine St"
      ],
      "avenues": [
        "Franklin Ave",
        "Oakwood Ave"
      ],
      "gang": "Oakwood Crew",
      "notes": "corner shopfront"
    },
    {
      "id": "L045",
      "name": "Oakwood Apartments",
      "category": "Tenement",
      "x": 392,
      "y": 1215,
      "bounds": [
        353,
        1140,
        432,
        1290
      ],
      "block": "B5",
      "streets": [
        "Pine St",
        "Elm St"
      ],
      "avenues": [
        "Franklin Ave",
        "Oakwood Ave"
      ],
      "gang": "Oakwood Crew",
      "notes": "western tenement"
    },
    {
      "id": "L046",
      "name": "The Marlowe",
      "category": "Tenement",
      "x": 473,
      "y": 1218,
      "bounds": [
        430,
        1140,
        516,
        1295
      ],
      "block": "B5",
      "streets": [
        "Pine St",
        "Elm St"
      ],
      "avenues": [
        "Franklin Ave",
        "Oakwood Ave"
      ],
      "gang": "Oakwood Crew",
      "notes": "central tenement"
    },
    {
      "id": "L047",
      "name": "Liberty Apartments",
      "category": "Tenement",
      "x": 402,
      "y": 1350,
      "bounds": [
        350,
        1300,
        455,
        1400
      ],
      "block": "B5",
      "streets": [
        "Pine St",
        "Elm St"
      ],
      "avenues": [
        "Franklin Ave",
        "Oakwood Ave"
      ],
      "gang": "Oakwood Crew",
      "notes": "southern apartments"
    },
    {
      "id": "L048",
      "name": "Oakwood Store",
      "category": "Shopfront / mixed-use",
      "x": 494,
      "y": 1338,
      "bounds": [
        457,
        1272,
        530,
        1405
      ],
      "block": "B5",
      "streets": [
        "Pine St",
        "Elm St"
      ],
      "avenues": [
        "Franklin Ave",
        "Oakwood Ave"
      ],
      "gang": "Oakwood Crew",
      "notes": "east-facing store"
    },
    {
      "id": "L049",
      "name": "Dockside Lodgings",
      "category": "Tenement",
      "x": 635,
      "y": 1232,
      "bounds": [
        590,
        1138,
        680,
        1325
      ],
      "block": "C5",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Franklin Ave",
        "Oakwood Ave"
      ],
      "gang": "Oakwood Crew",
      "notes": "western tenement"
    },
    {
      "id": "L050",
      "name": "The Roosevelt",
      "category": "Tenement",
      "x": 768,
      "y": 1264,
      "bounds": [
        724,
        1190,
        812,
        1338
      ],
      "block": "C5",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Franklin Ave",
        "Oakwood Ave"
      ],
      "gang": "Oakwood Crew",
      "notes": "central tenement"
    },
    {
      "id": "L051",
      "name": "City News",
      "category": "Shopfront / mixed-use",
      "x": 636,
      "y": 1365,
      "bounds": [
        590,
        1320,
        682,
        1410
      ],
      "block": "C5",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Franklin Ave",
        "Oakwood Ave"
      ],
      "gang": "Oakwood Crew",
      "notes": "south-west shopfront"
    },
    {
      "id": "L052",
      "name": "Harbour View Flats",
      "category": "Tenement",
      "x": 856,
      "y": 1359,
      "bounds": [
        782,
        1308,
        930,
        1410
      ],
      "block": "C5",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Franklin Ave",
        "Oakwood Ave"
      ],
      "gang": "Oakwood Crew",
      "notes": "long south flats"
    },
    {
      "id": "L053",
      "name": "Oakwood Park",
      "category": "Park",
      "x": 171,
      "y": 1492,
      "bounds": [
        62,
        1450,
        280,
        1535
      ],
      "block": "A6",
      "streets": [
        "West St",
        "Pine St"
      ],
      "avenues": [
        "Oakwood Ave",
        "south edge"
      ],
      "gang": "Oakwood Crew",
      "notes": "bottom-left park, cropped"
    },
    {
      "id": "L054",
      "name": "8 Oakwood Avenue",
      "category": "House",
      "x": 405,
      "y": 1486,
      "bounds": [
        350,
        1438,
        460,
        1535
      ],
      "block": "B6",
      "streets": [
        "Pine St",
        "Elm St"
      ],
      "avenues": [
        "Oakwood Ave",
        "south edge"
      ],
      "gang": "Oakwood Crew",
      "notes": "bottom row home, cropped"
    },
    {
      "id": "L055",
      "name": "Rose Cottage",
      "category": "House",
      "x": 495,
      "y": 1492,
      "bounds": [
        454,
        1450,
        536,
        1535
      ],
      "block": "B6",
      "streets": [
        "Pine St",
        "Elm St"
      ],
      "avenues": [
        "Oakwood Ave",
        "south edge"
      ],
      "gang": "Oakwood Crew",
      "notes": "bottom row home, cropped"
    },
    {
      "id": "L056",
      "name": "Riverside Gardens",
      "category": "Park",
      "x": 640,
      "y": 1490,
      "bounds": [
        585,
        1445,
        695,
        1535
      ],
      "block": "C6",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Oakwood Ave",
        "south edge"
      ],
      "gang": "Oakwood Crew",
      "notes": "bottom row green area, cropped"
    },
    {
      "id": "L057",
      "name": "Harper House",
      "category": "House",
      "x": 736,
      "y": 1490,
      "bounds": [
        695,
        1445,
        778,
        1535
      ],
      "block": "C6",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Oakwood Ave",
        "south edge"
      ],
      "gang": "Oakwood Crew",
      "notes": "bottom row home, cropped"
    },
    {
      "id": "L058",
      "name": "Oak House",
      "category": "House",
      "x": 858,
      "y": 1490,
      "bounds": [
        785,
        1445,
        930,
        1535
      ],
      "block": "C6",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Oakwood Ave",
        "south edge"
      ],
      "gang": "Oakwood Crew",
      "notes": "bottom row homes, cropped"
    }
  ],
  "piers": [
    {
      "id": "L017",
      "name": "North Pier",
      "category": "Pier",
      "x": 944,
      "y": 330,
      "bounds": [
        908,
        313,
        979,
        348
      ],
      "block": "C2",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Harrison Ave",
        "Madison Ave"
      ],
      "gang": "The Longshoremen",
      "notes": "upper river pier"
    },
    {
      "id": "L030",
      "name": "South Pier",
      "category": "Pier",
      "x": 949,
      "y": 755,
      "bounds": [
        914,
        740,
        984,
        770
      ],
      "block": "C3",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Madison Ave",
        "Jefferson Ave"
      ],
      "gang": "The Longshoremen",
      "notes": "middle river pier"
    },
    {
      "id": "L040",
      "name": "Commercial Pier",
      "category": "Pier",
      "x": 952,
      "y": 1000,
      "bounds": [
        925,
        984,
        980,
        1015
      ],
      "block": "C4",
      "streets": [
        "Elm St",
        "River St"
      ],
      "avenues": [
        "Jefferson Ave",
        "Franklin Ave"
      ],
      "gang": "The Longshoremen",
      "notes": "lower river pier"
    }
  ],
  "gang_hub_icons": [
    {
      "gang": "The Longshoremen",
      "x": 709,
      "y": 708,
      "block": "C3"
    },
    {
      "gang": "Factory Boys",
      "x": 183,
      "y": 986,
      "block": "A4"
    },
    {
      "gang": "Oakwood Crew",
      "x": 436,
      "y": 1270,
      "block": "B5"
    },
    {
      "gang": "Riverside Syndicate",
      "x": 436,
      "y": 155,
      "block": "B1"
    }
  ]
};
