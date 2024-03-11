import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {
  transform(value: any[], args?: any): any {
    if (!value) {
      return value;
    }

    value.sort((a: any, b: any) => {
      if (a.dates.start.localDate === b.dates.start.localDate) {
        return a.dates.start.localTime.localeCompare(b.dates.start.localTime);
      }
      return b.dates.start.localDate.localeCompare(a.dates.start.localDate);
    });

    if (args === 'reverse') {
      value.reverse();
    }

    return value;
  }
}
