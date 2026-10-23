# Balance Update 8

Normal is the recommended setting for new games. Existing resources and progress are retained when loading; use a new Normal game to reproduce the calibrated start.

## Parameters

- Household: two adults, two children. Need: 28 per adult, 18 per child, 10 per infant; 92 total at the start.
- Normal: 300 G and 60 food; 20 goats. Relaxed: 450 G and 120 food; 7 cattle.
- Fields: two millet, one vegetables, two pasture, five forest.
- Standard yields: millet 34 food, vegetables 68 G, before soil/weather/tool modifiers.
- Annual millet seed/work costs: 8 G / 0.65 work. Forest: 1 G / 0.08 work.
- Animal food: 5 per cattle, 1.75 per goat, before drought adjustment.
- Food purchases stay at 1 G per unit. No drought price surcharge.
- Wells and terraces each cost 1 G annual upkeep, included in the plan quote before committing.
- First Normal/Relaxed year is a good rainy season. Later Normal weather probabilities: drought 12%, heavy rain 12%, dry year 18%, good 43%, rich 15%.
- Harder settings have less starting capital/food and higher severe-weather frequency. Household size stays the same.

## Calibration

`node tests/balance.cjs` runs four simple scripted policies over 500 seeds each, up to 30 years. These are artificial comparisons, not forecasts of human win rates. Failure includes running out of affordable labor/field plans after emergency animal sales, as well as abandoning the farm.

Normal sample results: percentage completing 20 years:

| Test policy | Completion |
| --- | --- |
| Repeat original field plan, no strategic investments | 4.2% |
| Millet-focused, sell surplus/animals, buy tools, no soil investment or family planning | 0.2% |
| Vegetables-focused, sell surplus/animals, buy tools | 41.0% |
| Mixed crops, family planning, reserve management, tools, wells and terraces | 83.0% |

All sample policies completed five years. The passive policy completed ten years in 93.6% of samples. The different family-planning choices are part of the policies, so this comparison does not isolate the causal effect of irrigation alone. The mixed policy's capital after ten years remains modest: investment has an opportunity cost. Long-term soil, liquidity and family decisions matter more than surviving the first harvest.

The suite also checks a safe first year, migration idempotence, starter-family correction, disclosed upkeep and the fixed food price. Existing simulation, UI-harness, co-op and expansion/technology checks continue to pass. Browser visual QA is not part of these automated checks.
