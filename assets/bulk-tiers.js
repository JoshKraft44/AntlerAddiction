if (!customElements.get('bulk-tiers')) {
  customElements.define(
    'bulk-tiers',
    class BulkTiers extends HTMLElement {
      connectedCallback() {
        this.radios = Array.from(this.querySelectorAll('input[type="radio"]'));
        this.input = document.getElementById(`Quantity-${this.dataset.section}`);
        this.stock = JSON.parse(this.dataset.stock || '{}');
        this.money = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });

        this.radios.forEach((radio) => radio.addEventListener('change', () => this.setQuantity(radio.value)));
        this.input?.addEventListener('change', () => this.matchInput());

        this.unsubscribe = subscribe(PUB_SUB_EVENTS.variantChange, ({ data }) => {
          if (data.sectionId !== this.dataset.section || !data.variant) return;
          this.updateVariant(data.variant);
        });
      }

      disconnectedCallback() {
        if (this.unsubscribe) this.unsubscribe();
      }

      setQuantity(qty) {
        if (!this.input) return;
        this.input.value = qty;
        this.input.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // highlight the best tier the typed quantity qualifies for
      matchInput() {
        const qty = parseInt(this.input.value) || 1;
        let match = this.radios[0];
        this.radios.forEach((radio) => {
          if (!radio.disabled && qty >= parseInt(radio.value)) match = radio;
        });
        this.radios.forEach((radio) => (radio.checked = radio === match));
      }

      updateVariant(variant) {
        const stock = this.stock[variant.id];

        this.radios.forEach((radio) => {
          const qty = parseInt(radio.value);
          const pct = parseInt(radio.dataset.pct);
          const unitWas = Math.max(variant.price, variant.compare_at_price || 0);
          const full = unitWas * qty;
          const total = Math.round((variant.price * qty * (100 - pct)) / 100);
          const card = radio.closest('.bulk-tiers__card');

          card.querySelector('[data-total]').textContent = this.format(total);
          card.querySelector('[data-each]').textContent = this.format(Math.floor(total / qty));
          const fullEl = card.querySelector('[data-full]');
          fullEl.textContent = this.format(full);
          fullEl.hidden = full <= total;

          radio.disabled = !variant.available || (stock != null && stock < qty);
        });

        // the old tier might not be in stock for this style
        const checked = this.radios.find((radio) => radio.checked);
        if (checked && checked.disabled) {
          const fallback = this.radios.filter((radio) => !radio.disabled).pop() || this.radios[0];
          fallback.checked = true;
          this.setQuantity(fallback.value);
        }
      }

      format(cents) {
        return this.money.format(cents / 100);
      }
    }
  );
}
