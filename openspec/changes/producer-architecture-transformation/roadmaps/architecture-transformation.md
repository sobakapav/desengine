# Roadmap: Architecture Transformation Producer

## Владелец

`producer-architecture-transformation` ведёт продюсерский roadmap архитектурной трансформации и формирует ожидания к downstream delivery без прямого подчинения dispatcher.

## Ожидания к delivery

- sequencing-first: foundation, capability и cleanup steps не смешиваются в одну плоскую очередь;
- platform decisions по sourcing, event boundaries и packaging readiness не расходятся по разным тактическим линиям;
- конфликт между producer-ожиданием и dispatcher-прагматикой допускается и фиксируется явно, если это снижает архитектурный риск.

## Когда нужен downstream dispatcher

- когда нужен operational backlog и тактическая нарезка implement/fix changes;
- когда producer-задача должна быть соотнесена с roadmap `focus-tech`, но не сводится к нему полностью;
- когда требуется удерживать delivery-границы отдельно от продюсерского порядка и ожиданий.
