---
date: "2018-10-08T00:00:00Z"
excerpt: A few weeks ago I attended a DDDBelgium meetup where I was lucky to participate in a refactor workshop lead by Pim and Joop. After the incredible workshop Pim, Dries and me were discussing some code that we refactored earlier . Not so long in the conversation the words “Integration Operation Segregation Principle” casually got dropped by Pim.
featured: /assets/posts/2018-10-09-princ/header.jpg
title: The Integration Operation Segregation Principle
tump: /assets/posts/2018-10-09-princ/tump.jpg
---

A few weeks ago I attended a [DDDBelgium meetup](https://www.meetup.com/dddbelgium/events/252030211) where I was lucky to participate in a refactor workshop lead by [Pim](https://twitter.com/Pelshoff) and [Joop](https://twitter.com/jlammerts). After the incredible workshop Pim, [Dries](https://twitter.com/driesvints) and me were discussing some code that we refactored earlier . Not so long in the conversation the words "Integration Operation Segregation Principle" casually got dropped by Pim.

Now I'm going, to be honest with you (as I was with them), I had no idea what the hell he was talking about. And maybe neither do you.

## A simple PriceCalculator

Let's take a look at some code:
{{< highlight php "linenos=table" >}}
    <?php
    declare(strict_types=1);
    
    namespace Car\Rent;
    
    final class PriceCalculator
    {
        public function calculate(CarRental $carRental): int
        {
            $startDate = $carRental->getStartDate();
            $endDate = $carRental->getEndDate();
            $days = $startDate->diff($endDate);
            $dayPrice = $days * $carRental->getPricePerDay();
    
            return $dayPrice + ($carRental->getDistance() * $carRental->getPricePerKm());
        }
    }
{{< / highlight >}}
As you can see, we have a small piece of code that calculates the price for a few days of rental.

The code itself is pretty straightforward. We gather the start date, the end date. We calculate the number of days and later on multiply those days by the price + the km's driven. A small piece of code, that does a lot.

No code is complete without a test:
{{< highlight php "linenos=table" >}}
    <?php
    declare(strict_types=1);
    
    namespace Tests\Car\Rent;
    
    class PriceCalculatorTest extends TestCase
    {
        /**
         * @test
         */
        public function it_calculates_a_price()
        {
            $carRental = $this->getMockBuilder(CarRental::class)
                ->disableOriginalConstructor()
                ->getMock();
    
            $carRental->expects($this->once())
                ->method('getStartDate')
                ->willReturn(time());
    
            $carRental->expects($this->once())
                ->method('getEndDate')
                ->willReturn(time());
    
            $carRental->expects($this->once())
                ->method('getEndDate')
                ->willReturn(time());
    
            $carRental->expects($this->once())
                ->method('getPricePerDay')
                ->willReturn(10);
    
            $carRental->expects($this->once())
                ->method('getDistance')
                ->willReturn(10);
    
            $carRental->expects($this->once())
                ->method('getPricePerKm')
                ->willReturn(1);
    
            $calculator = new PriceCalculator();
            $price = $calculator->calculate($carRental);
    
            $this->assertSame(110, $price);
        }
    }
{{< / highlight >}}
That's a big test.

It mocks a few things, then calls the calculator and asserts the results. All in all a very simple unit test, but not a fun one to write.

## Turning code into a lot more code

If we take a look at that `PriceCalculator` class you can see it structurally does 2 things: it **fetches data** and **performs actions** on that data. Or in other words: it **integrates** and **operates.**

At this point, you probably already figured out when the Integration Operation Segregation Principle is all about: splitting these up. Let me show what the previous class looks like with this principle applied:
{{< highlight php "linenos=table" >}}
    <?php
    declare(strict_types=1);
    
    namespace Car\Rent;
    
    final class PriceCalculator
    {
        private $dateRangePriceCalculator;
        private $distancePriceCalculator;
        private $dayDistanceCalculator;
    
        public function __construct(
            DateRangePriceCalculator $dateRangePriceCalculator,
            DistancePriceCalculator $distancePriceCalculator,
            DayDistanceCalculator $dayDistanceCalculator
        )
        {
            $this->dateRangePriceCalculator = $dateRangePriceCalculator;
            $this->distancePriceCalculator = $distancePriceCalculator;
            $this->dayDistanceCalculator = $dayDistanceCalculator;
        }
    
        public function calculate(CarRental $carRental): int
        {
            $startDate = $carRental->getStartDate();
            $endDate = $carRental->getEndDate();
            $days = $startDate->diff($endDate);
    
            $dayPrice = $this->dateRangePriceCalculator->calculate(
                $days,
                $carRental->getPricePerDay()
            );
            $distancePrice = $this->distancePriceCalculator->calculate(
                $carRental->getDistance(), 
    						$carRental->getPricePerKm()
            );
    
            return $this->dayDistanceCalculator->calculate(
    						$dayPrice, 
    						$distancePrice
    				);
        }
    }
{{< / highlight >}}
{{< highlight php "linenos=table" >}}
    <?php
    declare(strict_types=1);
    
    namespace Car\Rent;
    
    final class DateRangePriceCalculator
    {
        public function calculate(int $days, int $pricePerDay) :int
        {
            return $days * $pricePerDay;
        }
    }
{{< / highlight >}}
{{< highlight php "linenos=table" >}}
    <?php
    declare(strict_types=1);
    
    namespace Car\Rent;
    
    final class DistancePriceCalculator
    {
        public function calculate(int $distance, int $pricePerKm): int
        {
            return $distance * $pricePerKm;
        }
    }
{{< / highlight >}}
{{< highlight php "linenos=table" >}}
    <?php
    declare(strict_types=1);
    
    namespace Car\Rent;
    
    final class DayDistanceCalculator
    {
        public function calculate(int $dayPrice, int $distancePrice): int
        {
            return $dayPrice + $distancePrice;
        }
    }
{{< / highlight >}}
"Frederick you devious hack!" you might shout, You've turned a small method into a 4 class method that more than doubles the lines of code.

Well, you're not wrong. It's way more code. And on first glance, it looks way more complex. But let's take a step back and go over it.

## Extracting complexity

if you strip away the dependency injection etc, you're left with
{{< highlight php "linenos=table" >}}
<?php
    public function calculate(CarRental $carRental): int
    {
        $startDate = $carRental->getStartDate();
        $endDate = $carRental->getEndDate();
        $days = $startDate->diff($endDate);

        $dayPrice = $this->dateRangePriceCalculator->calculate(
            $days,
            $carRental->getPricePerDay()
        );
        $distancePrice = $this->distancePriceCalculator->calculate(
            $carRental->getDistance(), 
                        $carRental->getPricePerKm()
        );

        return $this->dayDistanceCalculator->calculate(
                        $dayPrice, 
                        $distancePrice
                );
    }
{{< / highlight >}}
There is nothing complex going on here. Everything perfectly describes what is happening. That `$dayPrice` ? Oh, it's been calculated, how is it being calculated? Who cares. No need to worry about it. Someone with almost no programming knowledge can read this method and fully understand what's happening here.

But what about the logic.
{{< highlight php "linenos=table" >}}
<?php
    final class DateRangePriceCalculator
    {
        public function calculate(int $days, int $pricePerDay): int
        {
            return $days * $pricePerDay;
        }
    }
{{< / highlight >}}
I would argue that the logic in there is even more simple.

In the future, there might be some business logic changes (we might need to do something with tax?). We now know where we can do that, everything is contained in this little class.

This is also a nice illustration of the [Open–closed principle](https://en.wikipedia.org/wiki/Open–closed_principle).

So yes, we do have a lot more code. But it's all very simple code, easy to read, easy to debug and the coolest of all: Easy to test.
{{< highlight php "linenos=table" >}}
    <?php
    declare(strict_types=1);
    
    namespace Tests\Car\Rent;
    
    use Car\Rent\DateRangePriceCalculator;
    
    class DateRangePriceCalculatorTest extends TestCase
    {
        /**
         * @test
         */
        public function it_calculates_a_price_for_a_date_range()
        {
            $dateRangeCaluclator = new DateRangePriceCalculator();
            $price = $dateRangeCaluclator->calculate(2, 50);
    
            $this->assertSame(100, $price);
        }
    }
{{< / highlight >}}
Now that is a nice unit test. No mocks, easy to write, easy to read. (compare this to the unit test at the top of this article).

## Conclusion

As you can see the Integration Operation Segregation Principle is just a long and complicated term to describe something very simple. This all might seem like a lot of work, but it's worth it. Your code and especially your tests will thank you later

If you want to read more about this, do check out this incredible blogpost: [The Incremental Architect´s Napkin - #7 - Nest flows to scale functional design](http://geekswithblogs.net/theArchitectsNapkin/archive/2014/09/13/the-incremental-architectacutes-napkin---7---nest-flows-to.aspx)