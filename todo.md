1. move codebase to typescript
3. think of IoC regarding building scene
8. unit tests. It's time for unit tests
9. load models from somewhere else

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
- zaznaczony element listy zaznacza moduł (i mesh)