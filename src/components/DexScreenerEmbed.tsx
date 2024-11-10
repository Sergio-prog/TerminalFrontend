const DexScreenerEmbed = ({ tokenAddress }: { tokenAddress: string }) => {
    console.log(`https://dexscreener.com/ton/${tokenAddress}?embed=1&theme=dark`);
    return (
        <>
            {/* <div>
                <style>
                    {`
          #dexscreener-embed {
            position: relative;
            width: 100%;
            padding-bottom: 125%;
          }

          @media (min-width: 1400px) {
            #dexscreener-embed {
              padding-bottom: 65%;
            }
          }

          #dexscreener-embed iframe {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            border: 0;
          }
        `}
                </style>
                <div id="dexscreener-embed">
                    <iframe
                        src={`https://dexscreener.com/solana/${tokenAddress}?embed=1&theme=dark&trades=0&info=0`}
                        title="DexScreener Embed"
                    />
                </div>
            </div> */}
            <div>
                <style>
                    {`
                    #dexscreener-embed {
                        position: relative;
                        width:100%;
                        padding-bottom:60%;
                    }

                    @media(min-width:1400px) {
                        #dexscreener - embed {
                            padding - bottom:150%;
                        }
                    }

                    @media(max-width: 600px) {
                        #dexscreener-embed {
                            position: relative;
                            width:100%;
                            padding-bottom:100%;
                        }
                    }
                    
                    #dexscreener-embed iframe {
                        position:absolute;
                        width:100%;
                        height:100%;
                        top:0;
                        left:0;
                        border:0;
                    }
                    `}
                </style>
                <div id="dexscreener-embed">
                    <iframe src={`https://dexscreener.com/ton/${tokenAddress}?embed=1&theme=dark&trades=0&info=0`}>
                    </iframe>
                </div>
            </div>
        </>
    );
};

export default DexScreenerEmbed;
