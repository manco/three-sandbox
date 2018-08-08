3. think of IoC regarding building scene
8. unit tests. It's time for unit tests
9. load models from somewhere else

TS:
 TS#1: enum zamiast event type i ModuleType
 TS#2: przepisac OrbitControls i Loader na ts

10. zoptymalizowac rozmiar bundle'a!

optymalizacja:
   + nie wyliczac bounding box dla kazdego modelu, bazowac na wymiarach kuchni
   + ^ moze dzieki temu wystarczy jedna geometria

O Lista szafek z boku
O podawanie koloru korpusów (brył)
O ROZPOZNANIE: nakładanie tekstur, jak to się robi i czy łatwiej mieć osobną bryłę?
O Przycisk 'zamów' i wysłanie emaila <--- jak to zabezpieczyć?

lista szafek:
x kuchnia dodaje/usuwa szafkę, emituje event: ADDED | REMOVED, view(?) manipuluje DOMem
x czyli: kuchnia jest observable, w main.js (albo view.js?) sa rejestrowane funkcje manipulujace
- lepsze nazwy dla elementów
x grupowanie elementów po typie
- operacje na poziomie grupy (zmiana koloru)
x zaznaczony raycastem element zaznacza sie tez na liscie
x zaznaczony element listy zaznacza moduł (i mesh)

- obracac kuchnie wg srodka a nie czegostam