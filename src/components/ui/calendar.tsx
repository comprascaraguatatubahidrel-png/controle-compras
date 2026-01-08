"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown",
  buttonVariant = "ghost",
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      startMonth={new Date(new Date().getFullYear() - 10, 0)}
      endMonth={new Date(new Date().getFullYear() + 10, 11)}
      className={cn("bg-background p-3", className)}
      captionLayout={captionLayout}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 relative",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center h-9 mb-2",
        caption_label: "text-sm font-medium h-7 flex items-center",
        nav: "flex items-center justify-between absolute w-full top-0 h-9 z-10 px-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 shadow-sm border border-input flex items-center justify-center absolute left-1"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 shadow-sm border border-input flex items-center justify-center absolute right-1"
        ),
        table: "w-full border-collapse",
        weekdays: "flex w-full",
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none text-center",
        ),
        week: "flex w-full mt-2",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md rounded-md overflow-hidden",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-primary/10 transition-colors rounded-md"
        ),
        range_start: "day-range-start",
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        dropdowns: "flex justify-center gap-1",
        dropdown: "rdp-dropdown bg-background border rounded-md px-1 py-0.5 text-xs font-medium focus:ring-2 focus:ring-primary outline-none cursor-pointer hover:bg-accent transition-colors",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...props }) => {
          if (orientation === "left") return <ChevronLeftIcon className="h-4 w-4" />
          if (orientation === "right") return <ChevronRightIcon className="h-4 w-4" />
          return <ChevronDownIcon className="h-4 w-4" />
        },
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
        modifiers.selected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        modifiers.today && !modifiers.selected && "bg-accent text-accent-foreground",
        modifiers.outside && "text-muted-foreground opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
