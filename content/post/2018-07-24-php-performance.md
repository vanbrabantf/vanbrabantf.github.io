---
date: "2018-07-24T00:00:00Z"
excerpt: 'We''ve all been there before, you submit a pull request and moments later
  you get a comment like: ''Hey you should use a native function here, they are so
  much faster'' or ''You can declare this final, that way we save some processing
  power'''
featured: /assets/posts/2018-07-24-php-performance/header.jpg
title: What performance tricks actually work
tump: /assets/posts/2018-07-24-php-performance/tump.jpg
---

We've all been there before, you submit a pull request and moments later you get a comment like: "Hey you should use a native function here, they are so much faster" or "You can declare this final, that way we save some processing power".

It's great that we as developers keep an eye on this, but how true are these thing. And are they still a thing in newer PHP versions?

## To the laboratory

Time to put some of these "good practices" to the test. I've selected 10 speed tricks that I've picked up over the years and we're going to check how relevant they still are in PHP7.2.

So how are we going to test this? I've set up a small project that we are going to be running natively (no Docker, no vagrant) in MacOs (version: 10.13.5). The PHP version is the latest version currently on brew (PHP 7.2.8).

The benchmark itself uses [PHPBench](https://github.com/phpbench/phpbench) and we are going to compare each "trick" to its standard alternative. They are separate methods that each will be ran 1000 times over 5 iterations. So that means we will run each test 5000 times grouped over 5 results. That way we can minimise deviations and extract mean results.

Sounds like fun? Let's bust some myths.

But before we begin, please a word of warning. We are going to zoom in on these claims. Some of these results might seem pretty high but that is only because we only run very small pieces of code. The results might not be that extreme in your day to day code.

### Are single quotes faster than double quotes?

Let's start out with a classic. As single quotes are encouraged by PSR we all might be getting some small speed bonuses without knowing it. We will test with this code:

{{< highlight php "linenos=table" >}}
    <?php
        public function double(): void
        {
            $words = [
                "Taylor Swift",
                "her",
                "zodiac",
                "sign is",
                "sagittarius",
            ];
        }

        public function single(): void
        {
            $words = [
                'Taylor Swift',
                'her',
                'zodiac',
                'sign is',
                'sagittarius',
            ];
        }
{{< / highlight >}}

And these are the results:

{{< highlight bash "linenos=table" >}}
    +-----------+-------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
    | benchmark | subject     | groups | params | revs | its | mem_peak | best    | mean    | mode    | worst   | stdev   | rstdev | diff  |
    +-----------+-------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
    | TestBench | benchDouble |        | []     | 1000 | 5   | 890,368b | 0.217μs | 0.224μs | 0.222μs | 0.235μs | 0.006μs | 2.68%  | 1.00x |
    | TestBench | benchSingle |        | []     | 1000 | 5   | 890,368b | 0.232μs | 0.235μs | 0.233μs | 0.241μs | 0.003μs | 1.49%  | 1.05x |
    +-----------+-------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
{{< / highlight >}}

Turns out that single quotes are about 5% slower in this test.

### is Json faster than XML?

Sometimes we like to use Json or XML to setup validation or config files. Most people like to use Json over XML due to readability reasons. But is it also faster?

A quick word of warning here, we will be using the native `xmlrpc_encode` en `xmlrpc_decode` functions. These are very experimental and not fully implemented. We could be using packages for this, something I would certainly advice in real projects, but that would skew the results too much (as we need to load them in etc). So here is the code:

{{< highlight php "linenos=table" >}}
    <?php
        public function xml(): void
        {
            $words = [
                'Taylor Swift',
                'has 2 cats',
                'Meredith and',
                'Olivia',
            ];

            $encode = xmlrpc_encode($words);
            $decode = xmlrpc_decode($encode);
        }

        public function json(): void
        {
            $words = [
                'Taylor Swift',
                'has 2 cats',
                'Meredith and',
                'Olivia',
            ];

            $encode = json_encode($words);
            $decode = json_decode($encode);
        }
{{< / highlight >}}

And unsurprisingly here are the results:

{{< highlight bash "linenos=table" >}}
    +-----------+-----------+--------+--------+------+-----+----------+----------+----------+----------+----------+---------+--------+--------+
    | benchmark | subject   | groups | params | revs | its | mem_peak | best     | mean     | mode     | worst    | stdev   | rstdev | diff   |
    +-----------+-----------+--------+--------+------+-----+----------+----------+----------+----------+----------+---------+--------+--------+
    | TestBench | benchXml  |        | []     | 1000 | 5   | 890,368b | 26.991μs | 27.577μs | 27.216μs | 28.325μs | 0.534μs | 1.94%  | 28.13x |
    | TestBench | benchJson |        | []     | 1000 | 5   | 890,368b | 0.939μs  | 0.980μs  | 0.959μs  | 1.025μs  | 0.035μs | 3.54%  | 1.00x  |
    +-----------+-----------+--------+--------+------+-----+----------+----------+----------+----------+----------+---------+--------+--------+
{{< / highlight >}}

The native experimental functions that deal with XML are way slower in our tests.

### Using loads of layered objects is way slower?

This one will be a bit messy to display. We are going to new up some classes and send the parameters down 3 layers. There we execute the same function as we otherwise would.

I think we all know that the new-ing up of classes will lose us some time, but let's see how much time we lose.

{{< highlight php "linenos=table" >}}
    <?php

    namespace App;

    class Tester
    {
        public function spaghetti(): void
        {
            for ($i = 1; $i <= 100; $i++) {
                $i++;
            }
        }

        public function lasagne(): void
        {
            $layers = new LayerOne();
            $layers->down();
        }
    }

    class LayerOne
    {
        public function down(): void
        {
            $layer = new LayerTwo();
            $layer->down();
        }
    }

    class LayerTwo
    {
        public function down(): void
        {
            $layer = new LayerThree();
            $layer->doTheLoop();
        }
    }

    class LayerThree
    {
        public function doTheLoop(): void
        {
            for ($i = 1; $i <= 100; $i++) {
                $i++;
            }
        }
    }
{{< / highlight >}}

{{< highlight bash "linenos=table" >}}
    +-----------+----------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
    | benchmark | subject        | groups | params | revs | its | mem_peak | best    | mean    | mode    | worst   | stdev   | rstdev | diff  |
    +-----------+----------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
    | TestBench | benchSpaghetti |        | []     | 1000 | 5   | 890,368b | 1.121μs | 1.161μs | 1.155μs | 1.210μs | 0.029μs | 2.46%  | 1.00x |
    | TestBench | benchLasagne   |        | []     | 1000 | 5   | 890,368b | 1.418μs | 1.448μs | 1.432μs | 1.484μs | 0.026μs | 1.78%  | 1.25x |
    +-----------+----------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
{{< / highlight >}}

Unsurprisingly the new-ing up of classes takes some time. In this case it comes down to about 25% slower. This obviously doesn't mean you shouldn't be using classes anymore. Personally I will always prefer the maintainability over the speed.

### Native array functions should be faster than loops right?

This is a classic. It's said that native array functions are faster than foreach loops because they are native C functions. This is the code we will be running:

{{< highlight php "linenos=table" >}}
    <?php
        public function native(): void
        {
            $words = ['i', 'am', 'not', 'shouting'];

            $shouts = array_map(
                function ($word) {
                    return strtoupper($word);
                }, $words);
        }

        public function loop(): void
        {
            $words = ['i', 'am', 'not', 'shouting'];
            $shouts = [];

            foreach ($words as $word) {
                $shouts[] = strtoupper($word);
            }
        }
{{< / highlight >}}

I'm going to be totally honest here and say that I've ran this test a few times now, cause I couldn't really believe the results:

{{< highlight bash "linenos=table" >}}
    +-----------+-------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
    | benchmark | subject     | groups | params | revs | its | mem_peak | best    | mean    | mode    | worst   | stdev   | rstdev | diff  |
    +-----------+-------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
    | TestBench | benchNative |        | []     | 1000 | 5   | 890,368b | 0.817μs | 0.847μs | 0.859μs | 0.876μs | 0.022μs | 2.60%  | 1.36x |
    | TestBench | benchLoop   |        | []     | 1000 | 5   | 890,368b | 0.611μs | 0.623μs | 0.616μs | 0.647μs | 0.013μs | 2.16%  | 1.00x |
    +-----------+-------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
{{< / highlight >}}

Turns out that in this test the `array_map` method is slower than the `foreach`.
This probably has something to do with the anonymous function.

### $row[’id’] is 7 times faster than $row[id] ?

I've never heard of this one. Apparently it's a thing:

{{< highlight php "linenos=table" >}}
    <?php
    	public function fetchByString(): void
        {
            $array = [
                'Ariana Grande\'s',
                'favourite cereal',
                'is cocoa puffs',
            ];

            $who = $array['0'];
        }

        public function fetchByInteger(): void
        {
            $array = [
                'Ariana Grande\'s',
                'favourite cereal',
                'is cocoa puffs',
            ];

            $who = $array[0];
        }
{{< / highlight >}}

Turns out it doesn't really make a lot of difference, at least not in the 700% range.

{{< highlight bash "linenos=table" >}}
    +-----------+--------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
    | benchmark | subject      | groups | params | revs | its | mem_peak | best    | mean    | mode    | worst   | stdev   | rstdev | diff  |
    +-----------+--------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
    | TestBench | benchString  |        | []     | 1000 | 5   | 890,368b | 0.228μs | 0.238μs | 0.233μs | 0.248μs | 0.008μs | 3.28%  | 1.02x |
    | TestBench | benchInteger |        | []     | 1000 | 5   | 890,368b | 0.224μs | 0.232μs | 0.234μs | 0.242μs | 0.007μs | 2.98%  | 1.00x |
    +-----------+--------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
{{< / highlight >}}

The string fetching is even marginally slower in our test by 2%.

### Are throws super expensive?

Error handling is an important part of any application, but it is said you should be a bit weary of using extensive amounts of `try catch` blocks. Time to put it to the test.

{{< highlight php "linenos=table" >}}
    <?php

    public function errorHandling(): void
        {
            $i = 0;
            try {
                while ($i <= 100) {
                    $i++;
                }

                throw new \Exception('Some sweet error handling.');
            } catch (\Exception $e) {
            }
        }

        public function noErrorHandling(): void
        {
            $i = 0;
            while ($i <= 100) {
                $i++;
            }
        }
{{< / highlight >}}

And the results:

{{< highlight bash "linenos=table" >}}
    +-----------+--------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
    | benchmark | subject      | groups | params | revs | its | mem_peak | best    | mean    | mode    | worst   | stdev   | rstdev | diff  |
    +-----------+--------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
    | TestBench | benchError   |        | []     | 1000 | 5   | 890,368b | 2.056μs | 2.164μs | 2.218μs | 2.226μs | 0.075μs | 3.45%  | 1.55x |
    | TestBench | benchNoError |        | []     | 1000 | 5   | 890,368b | 1.346μs | 1.398μs | 1.367μs | 1.455μs | 0.045μs | 3.21%  | 1.00x |
    +-----------+--------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
{{< / highlight >}}

Unsurprisingly we lose some time on the errorHandling. But personally I would always recommend having more error handling over having less.

### What is the impact of unused vars?

Most static analysis tools tends to either complain about unused vars, or straight up remove them for you.

As unused vars in your code serve no real benefit, it doesn't really makes sense to keep them. That said, let's take a look at the cost.

{{< highlight php "linenos=table" >}}
    <?php

    public function unusedvars(): void
        {
            $var1 = "Lorde";
            $var2 = "loves";
            $var3 = "peanut";
            $var4 = "m&ms";

            $i = 0;
            while ($i <= 100) {
                $i++;
            }
        }

        public function noUnusedvars(): void
        {
            $i = 0;
            while ($i <= 100) {
                $i++;
            }
        }
{{< / highlight >}}

and the results:

{{< highlight bash "linenos=table" >}}
    +-----------+-------------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
    | benchmark | subject           | groups | params | revs | its | mem_peak | best    | mean    | mode    | worst   | stdev   | rstdev | diff  |
    +-----------+-------------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
    | TestBench | benchUnusedVars   |        | []     | 1000 | 5   | 890,368b | 1.444μs | 1.483μs | 1.492μs | 1.507μs | 0.023μs | 1.53%  | 1.07x |
    | TestBench | benchNoUnusedVars |        | []     | 1000 | 5   | 890,384b | 1.317μs | 1.382μs | 1.405μs | 1.424μs | 0.040μs | 2.88%  | 1.00x |
    +-----------+-------------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
{{< / highlight >}}

So it is about 7% in our tests. But as you probably know, there is no real reason to keep those vars around.

### Magic methods are slower than regular ones?

I love to use value objects. And in those objects I normally use `__toString()` to cast the object to a string. But I've had some remarks that you should just make them yourself to have a speed boost. Time to take a look at that.

{{< highlight php "linenos=table" >}}
    <?php

    class Tester
    {
        public function magic(): void
        {
            $tea = new Tea();
            $advice = 'I know ' . $tea;
        }

        public function noMagic(): void
        {
            $tea = new Tea();
            $advice = 'I know ' . $tea->toString();
        }
    }

    class Tea
    {
        public function __toString(): string
        {
            return 'tea water shouln\t boil';
        }

        public function toString(): string
        {
            return 'tea water shouln\t boil';
        }
    }
{{< / highlight >}}

{{< highlight bash "linenos=table" >}}
    +-----------+--------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
    | benchmark | subject      | groups | params | revs | its | mem_peak | best    | mean    | mode    | worst   | stdev   | rstdev | diff  |
    +-----------+--------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
    | TestBench | benchMagic   |        | []     | 1000 | 5   | 890,368b | 0.392μs | 0.401μs | 0.404μs | 0.409μs | 0.006μs | 1.46%  | 1.12x |
    | TestBench | benchNoMagic |        | []     | 1000 | 5   | 890,368b | 0.342μs | 0.357μs | 0.361μs | 0.370μs | 0.010μs | 2.78%  | 1.00x |
    +-----------+--------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
{{< / highlight >}}

Turns out magic methods are indeed a tiny bit slower, at about 12% in this test.

### Final classes should be faster than non final classes?

A friend of mine (the very talented [Wouter Sioen](https://twitter.com/WouterSioen)) declares his classes `final` on creation and only changes it when they really need to be extended.

I'm pretty sure he does that due to OOP reasons, but maybe it's also a bit faster. That could make sense right?

{{< highlight php "linenos=table" >}}
    <?php

    class Tester
    {
        public function useFinal(): void
        {
            $tea = new Tea();
            $advice = (string) $tea;
        }

        public function dontUseFinal(): void
        {
            $coffee = new Coffee();
            $advice = (string) $coffee;
        }
    }

    final class Tea
    {
        public function __toString(): string
        {
            return 'you should drink some';
        }
    }

    class Coffee
    {
        public function __toString(): string
        {
            return 'you should drink some';
        }
    }
{{< / highlight >}}

Turns out it does

{{< highlight bash "linenos=table" >}}
    +-----------+--------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
    | benchmark | subject      | groups | params | revs | its | mem_peak | best    | mean    | mode    | worst   | stdev   | rstdev | diff  |
    +-----------+--------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
    | TestBench | benchFinal   |        | []     | 1000 | 5   | 890,368b | 0.363μs | 0.369μs | 0.365μs | 0.382μs | 0.007μs | 1.96%  | 1.00x |
    | TestBench | benchNoFinal |        | []     | 1000 | 5   | 890,368b | 0.373μs | 0.384μs | 0.386μs | 0.392μs | 0.006μs | 1.64%  | 1.04x |
    +-----------+--------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
{{< / highlight >}}

In our tests it is slightly faster to use `final`

That said, I think it a good thing to do any way.

### Do comments have impact on your code?

Ok this is the last one. This has brought so many discussions in the past. Docblocks over return types, code should be self documenting, ... You've seen the discussions before.

{{< highlight php "linenos=table" >}}
    <?php

    public function comments(): void
        {
            //Katy Perry is actually a stage name, her full name is Katheryn Elizabeth Hudson.
            //Perry is actually her mother’s maiden name.
            //She was born October 25, 1984 in Santa Barbara, California.
            //She has an older sister, Angela, and younger brother, Dan.
            //Both of her parents are pastors.
            $i = 0;
            while ($i <= 100) {
                $i++;
            }
        }

        public function noComments(): void
        {
            $i = 0;
            while ($i <= 100) {
                $i++;
            }
        }
{{< / highlight >}}

All of those Katy Perry facts result in:

{{< highlight bash "linenos=table" >}}
    +-----------+-----------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
    | benchmark | subject         | groups | params | revs | its | mem_peak | best    | mean    | mode    | worst   | stdev   | rstdev | diff  |
    +-----------+-----------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
    | TestBench | benchComments   |        | []     | 1000 | 5   | 890,368b | 1.400μs | 1.435μs | 1.422μs | 1.470μs | 0.026μs | 1.80%  | 1.08x |
    | TestBench | benchNoComments |        | []     | 1000 | 5   | 890,368b | 1.305μs | 1.326μs | 1.318μs | 1.346μs | 0.016μs | 1.19%  | 1.00x |
    +-----------+-----------------+--------+--------+------+-----+----------+---------+---------+---------+---------+---------+--------+-------+
{{< / highlight >}}

## About these tests

Some of these tests might surprise you, some might not. That said, please don't stare yourself blind at the results here. Speed is just one part of software development, and I personally think marginal gains don't out weight good developer practices.

At least you left here with some fun facts about pop stars.
