# KUMRU-2B

nasıl yapılacağını düzensiz biçimde yazıp yapay zekaya düzenlettirdim. ben yazdım aslında yani, takip edebilirsiniz çalışıyor


# KUMRU 2B Modelini vLLM ile Windows'ta Çalıştırma Rehberi

Bu rehber, `vngrs-ai/Kumru-2B` yapay zeka modelini [vLLM (Windows Fork)](https://github.com/SystemPanic/vllm-windows)'u kullanarak yerel bir Windows makinede nasıl çalıştıracağınızı adım adım açıklar.

## ⚠️ Önemli Uyarılar ve Sistem Gereksinimleri

  * **Disk Alanı:** Model ve kütüphanelerle birlikte yaklaşık **10 GB** boş disk alanına ihtiyacınız olacaktır.
  * **VRAM (Ekran Kartı Belleği):** Bu modelin en büyük gereksinimidir.
      * **6 GB VRAM (RTX 4050m):** Yapılan testlerde modelin 6 GB VRAM'e sığmadığı ve `ValueError: Free memory on device...` hatası verdiği görülmüştür.
      * **8 GB VRAM (RTX 4060 veya üstü):** Modelin çalışması için **minimum 8 GB VRAM**'e sahip bir NVIDIA ekran kartı önerilir. 8GB kartlarda bile, VRAM kullanımını optimize etmek için aşağıdaki ayar adımları gereklidir.
  * **Python:** Bu rehber spesifik olarak **Python 3.12** kullanılarak hazırlanmıştır.

-----

## Kurulum Adımları

### 1\. Adım: Python 3.12 Kurulumu

1.  Python 3.12'yi [resmi Python web sitesinden](https://www.python.org/downloads/release/python-3120/) indirin ve kurun.
2.  **Çoklu Python Sürümü Uyarısı:** Eğer sisteminizde (örneğin 3.14 gibi) başka bir Python sürümü zaten kuruluysa, komut satırı varsayılan olarak eski sürümü kullanabilir. Bu çakışmayı önlemek için, bu rehberdeki tüm komutları Python 3.12'nin kurulu olduğu klasörde çalıştıracağız.
3.  Python 3.12'nin `Scripts` klasörünü bulun. Genellikle varsayılan konum şudur:
    `C:\Users\KULLANICIADI\AppData\Local\Programs\Python\Python312\Scripts`
    (Burada `KULLANICIADI` yazan yeri kendi Windows kullanıcı adınızla değiştirin.)

### 2\. Adım: Gerekli Kütüphanelerin Kurulumu

1.  Python 3.12'nin `Scripts` klasörüne gidin (yukarıdaki adres).

2.  Bu klasörde bir Komut İstemi (CMD) penceresi açın. (Hızlı yol: Klasör içindeyken `Shift` tuşuna basılı tutup `Sağ Tık` yapın ve "Komut istemini burada aç (powershell kullanmayın)" seçeneğine tıklayın).

3.  **vLLM (Windows) Kurulumu:**

      * Aşağıdaki linkten vLLM için derlenmiş `.whl` dosyasını indirin:
        [vllm-0.11.0+cu124-cp312-cp312-win\_amd64.whl](https://github.com/SystemPanic/vllm-windows/releases/download/v0.11.0/vllm-0.11.0+cu124-cp312-cp312-win_amd64.whl)
      * İndirdiğiniz bu `.whl` dosyasını `Scripts` klasörünün içine taşıyın.
      * Açtığınız komut satırına aşağıdaki komutu yazarak vLLM'i kurun:
        ```bash
        pip install vllm-0.11.0+cu124-cp312-cp312-win_amd64.whl
        ```

4.  **PyTorch Kurulumu:**

      * vLLM kurulumu bittikten sonra, **aynı komut satırı penceresinde**, PyTorch'u kurmak için aşağıdaki komutu girin:
        ```bash
        pip install torch==2.7.1+cu126 torchaudio==2.7.1+cu126 torchvision==0.22.1+cu126 --index-url https://download.pytorch.org/whl/cu126
        ```

Kurulumlar tamamlandığında vLLM kullanılabilir hale gelmiş olmalıdır.

-----

## Modeli Çalıştırma ve VRAM Hata Ayıklama

Kurulumu yaptığımız `Scripts` klasörü varsayılan olarak Windows Sistem Yoluna (Path) eklenmediği için, `vllm` komutunu çalıştırmak için **her zaman `Scripts` klasörü içinden bir komut satırı açmanız** gerekmektedir.

### VRAM Hataları ve Çözümü (8GB Kartlar için)

Modeli doğrudan `vllm serve "vngrs-ai/Kumru-2B"` komutuyla çalıştırmak, özellikle 6-8GB gibi sınırlı VRAM'e sahip kartlarda çeşitli hatalara yol açacaktır. (sizde çalışırsa diğer adımları atlayın, Sohbet Arayüzünü Bağlama'ya geçin.)

**Sık Karşılaşılan Hatalar:**

  * `ValueError: Free memory on device (X/Y GiB) on startup is less than desired GPU memory utilization...`
  * `TORCHDYNAMO_VERBOSE=1 for the internal stack trace...` ile biten uzun bir hata mesajı.
  * `ValueError: No available memory for the cache blocks. Try increasing 'gpu_memory_utilization'...`

**Önerilen Çalıştırma Yöntemi (8GB+ VRAM):**

1.  Yeni bir komut satırı penceresini yine `...Python312\Scripts` klasöründe açın.
      * *Not: Bir hata alırsanız `Ctrl+C` komutu sunucuyu durdurmayabilir. Bu durumda komut satırı penceresini kapatıp yeniden açmanız gerekir.*
2.  İlk olarak, Torch derlemesini devre dışı bırakmak için aşağıdaki komutu girin ve Enter'a basın:
    ```bash
    set TORCH_COMPILE_DISABLE=1
    ```
3.  Şimdi, **aynı komut satırı penceresinde**, modeli VRAM kullanımını sınırlayarak başlatın:
    ```bash
    vllm serve "vngrs-ai/Kumru-2B" --gpu-memory-utilization 0.85
    ```

**Değer Ayarlama:**
Eğer `0.85` değeri ile `Free memory on device...` hatası alırsanız, bu değeri biraz düşürün (örn: `0.8`).
Eğer `No available memory for the cache blocks...` hatası alırsanız, bu değeri biraz yükseltmeyi deneyin (örn: `0.9`). Kartınız için en uygun VRAM kullanım oranını bulana kadar bu değerle oynamanız gerekebilir.

Sunucu başarıyla başladığında, API'nin çalıştığı adresleri (`http://localhost:8000` gibi) terminalde göreceksiniz.

-----

## Sohbet Arayüzünü Bağlama

vLLM sunucusu arka planda çalışırken, modele bağlanacak bir arayüz çalıştırabilirsiniz.

1.  Bu GitHub reposunu klonlayın.
2.  Arayüzün klasörüne gidin ve `node index.js` ile arayüz sunucusunu başlatın.
3.  Tarayıcınızdan `http://localhost:3000` adresine giderek modelle sohbet edebilirsiniz.

### Önerilen Sistem Talimatı (System Prompt)

Modelin bir sohbet botu gibi davranması için arayüzünüzde aşağıdaki sistem talimatını kullanabilirsiniz:

```
Adın Kumru. VNGRS tarafından Türkçe için sıfırdan eğitilmiş bir dil modelisin.
```

ben 7B modelin (şu anda kumru sitesinde olan) system propmtunun bir kısmını girmiştim öylesine. daha iyi olduğundan falan değil yani doğrusunu girin siz
