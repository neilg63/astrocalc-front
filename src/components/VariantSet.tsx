import { Show } from "solid-js";
import { matchAyaNameByNum } from "~/api/mappings";
import { Variant } from "~/api/models";

export default function VariantSet({ data }: { data: Variant }) {
  return <dl class="variant-set grid-2">
    <dt>Ayanamasha</dt>
    <dd>{ matchAyaNameByNum(data.ayanamashaNum)}</dd>
    <dt>charaKaraka</dt>
    <dd>{ data.charaKaraka}</dd>
    <dt>House / Sign / Nakshatra</dt>
    <dd class="slash-parts">
      <span>{data.house}</span>
      <span>{data.sign}</span>
      <span>{ data.nakshatra }</span>
    </dd>
    <Show when={data.hasRelationship}>
      <dt>Relationship</dt>
      <dd>{ data.relationship}</dd>
    </Show>
  </dl>
}