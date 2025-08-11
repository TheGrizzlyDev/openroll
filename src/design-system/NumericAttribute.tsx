import { NumberInput } from '@ark-ui/react'
import { Button } from '.'

interface NumericAttributeProps {
  id: string
  value: number
  onChange: (_value: number) => void
  min?: number
  max?: number
  step?: number
}

export function NumericAttribute({
  id,
  value,
  onChange,
  min,
  max,
  step = 1
}: NumericAttributeProps) {
  return (
      <NumberInput.Root
        id={id}
        value={value.toString()}
        onValueChange={details => onChange(details.valueAsNumber)}
        min={min}
        max={max}
        step={step}
      >
      <NumberInput.Control className="inline-flex items-center gap-2">
        <NumberInput.DecrementTrigger asChild>
          <Button type="button" aria-label={`Decrease ${id}`} className="h-10 w-10">
            −
          </Button>
        </NumberInput.DecrementTrigger>
        <NumberInput.Input className="h-10 w-10 text-center border border-accent font-mono font-bold" />
        <NumberInput.IncrementTrigger asChild>
          <Button type="button" aria-label={`Increase ${id}`} className="h-10 w-10">
            +
          </Button>
        </NumberInput.IncrementTrigger>
      </NumberInput.Control>
    </NumberInput.Root>
  )
}
